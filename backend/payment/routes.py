from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse
from typing import Optional
import aiohttp
import uuid
from datetime import datetime
from bson import ObjectId

from core.config import settings
from core.database import db
from auth.dependencies.auth import get_current_user

router = APIRouter(prefix="/payment", tags=["Payment"])

PAYMENT_COLLECTION = "payments"
USER_COLLECTION = "users"

@router.post("/initiate")
async def initiate_payment(
    data: dict, 
    current_user: dict = Depends(get_current_user)
):
    """
    Initiates payment with SSLCommerz.
    Expects data: {"plan": "monthly" | "yearly"}
    """
    plan = data.get("plan", "monthly")
    if plan == "yearly":
        amount = 2499.0
        plan_name = "premium_yearly"
    else:
        amount = 299.0
        plan_name = "premium_monthly"

    tran_id = f"TXT_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:6].upper()}"

    # Save transaction record in our database
    payment_doc = {
        "user_id": current_user["id"],
        "user_name": current_user.get("name", "User"),
        "user_email": current_user["email"],
        "tran_id": tran_id,
        "amount": amount,
        "plan": plan_name,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.get_collection(PAYMENT_COLLECTION).insert_one(payment_doc)

    # ── MOCK MODE: bypass SSLCommerz entirely (dev/demo only) ──────────────
    if settings.PAYMENT_MOCK_MODE:
        # Immediately mark payment as successful
        await db.get_collection(PAYMENT_COLLECTION).update_one(
            {"tran_id": tran_id},
            {"$set": {"status": "success", "payment_method": "MOCK", "updated_at": datetime.utcnow()}}
        )
        # Upgrade user to premium
        await db.get_collection(USER_COLLECTION).update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": {"user_type": "paid", "subscription": "premium"}}
        )
        mock_url = f"{settings.FRONTEND_URL}/payment/success?tran_id={tran_id}&mock=true"
        return {"success": True, "gateway_url": mock_url, "tran_id": tran_id}
    # ────────────────────────────────────────────────────────────────────────

    # Prepare SSLCommerz request parameters
    ssl_init_url = (
        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        if settings.SSLCOMMERZ_IS_SANDBOX
        else "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    )

    payload = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWD,
        "total_amount": str(amount),
        "currency": "BDT",
        "tran_id": tran_id,
        "success_url": f"{settings.BACKEND_URL}/api/payment/success",
        "fail_url": f"{settings.BACKEND_URL}/api/payment/fail",
        "cancel_url": f"{settings.BACKEND_URL}/api/payment/cancel",
        "ipn_url": f"{settings.BACKEND_URL}/api/payment/ipn",
        "cus_name": current_user.get("name", "Customer"),
        "cus_email": current_user["email"],
        "cus_add1": "Dhaka, Bangladesh",
        "cus_phone": current_user.get("phone", "01711111111"),
        "cus_country": "Bangladesh",
        "shipping_method": "NO",
        "product_name": f"Mentora Premium {plan.capitalize()} Plan",
        "product_category": "MentalHealthService",
        "product_profile": "non-physical-goods",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(ssl_init_url, data=payload) as resp:
                result = await resp.json()
                if result.get("status") == "SUCCESS":
                    gateway_url = result.get("GatewayPageURL")
                    return {
                        "success": True, 
                        "gateway_url": gateway_url, 
                        "tran_id": tran_id
                    }
                else:
                    # Update status to failed
                    await db.get_collection(PAYMENT_COLLECTION).update_one(
                        {"tran_id": tran_id},
                        {"$set": {"status": "failed", "error": result.get("failedreason", "Unknown error")}}
                    )
                    raise HTTPException(
                        status_code=400, 
                        detail=f"SSLCommerz initialization failed: {result.get('failedreason', 'Unknown reason')}"
                    )
    except Exception as e:
        print(f"Error in payment initiation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate payment: {str(e)}")


@router.post("/success")
async def payment_success(request: Request):
    """
    SSLCommerz Success Callback (via form POST redirect)
    """
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    val_id = form_data.get("val_id")
    amount = form_data.get("amount")
    card_type = form_data.get("card_type", "Card/MFS")
    bank_tran_id = form_data.get("bank_tran_id")

    if not tran_id or not val_id:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail?reason=missing_data", status_code=303)

    # Validate payment with SSLCommerz Validator API
    validation_url = (
        "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
        if settings.SSLCOMMERZ_IS_SANDBOX
        else "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
    )

    params = {
        "val_id": val_id,
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWD,
        "format": "json"
    }

    is_valid = False
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(validation_url, params=params) as resp:
                val_result = await resp.json()
                if val_result.get("status") in ["VALID", "VALIDATED"]:
                    is_valid = True
    except Exception as e:
        print(f"Payment validation failed on SSLCommerz side: {str(e)}")

    if is_valid:
        # Retrieve payment doc from database
        payment = await db.get_collection(PAYMENT_COLLECTION).find_one({"tran_id": tran_id})
        if payment:
            # Upgrade user
            await db.get_collection(USER_COLLECTION).update_one(
                {"_id": ObjectId(payment["user_id"])},
                {"$set": {"user_type": "paid", "subscription": "premium"}}
            )
            # Update payment doc
            await db.get_collection(PAYMENT_COLLECTION).update_one(
                {"tran_id": tran_id},
                {
                    "$set": {
                        "status": "success",
                        "val_id": val_id,
                        "payment_method": card_type,
                        "bank_tran_id": bank_tran_id,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/success?tran_id={tran_id}", status_code=303)
        
    # Validation failed or record not found
    await db.get_collection(PAYMENT_COLLECTION).update_one(
        {"tran_id": tran_id},
        {"$set": {"status": "failed", "updated_at": datetime.utcnow()}}
    )
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail?tran_id={tran_id}&reason=validation_failed", status_code=303)


@router.post("/fail")
async def payment_fail(request: Request):
    """
    SSLCommerz Fail Callback
    """
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    error = form_data.get("error", "Payment failed")

    await db.get_collection(PAYMENT_COLLECTION).update_one(
        {"tran_id": tran_id},
        {"$set": {"status": "failed", "error": error, "updated_at": datetime.utcnow()}}
    )

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/fail?tran_id={tran_id}", status_code=303)


@router.post("/cancel")
async def payment_cancel(request: Request):
    """
    SSLCommerz Cancel Callback
    """
    form_data = await request.form()
    tran_id = form_data.get("tran_id")

    await db.get_collection(PAYMENT_COLLECTION).update_one(
        {"tran_id": tran_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
    )

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/payment/cancel?tran_id={tran_id}", status_code=303)


@router.post("/ipn")
async def payment_ipn(request: Request):
    """
    SSLCommerz Instant Payment Notification Callback
    """
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    val_id = form_data.get("val_id")
    status = form_data.get("status")

    if status == "VALID" and tran_id and val_id:
        payment = await db.get_collection(PAYMENT_COLLECTION).find_one({"tran_id": tran_id})
        if payment and payment["status"] != "success":
            # Double validate
            validation_url = (
                "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
                if settings.SSLCOMMERZ_IS_SANDBOX
                else "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
            )
            params = {
                "val_id": val_id,
                "store_id": settings.SSLCOMMERZ_STORE_ID,
                "store_passwd": settings.SSLCOMMERZ_STORE_PASSWD,
                "format": "json"
            }
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(validation_url, params=params) as resp:
                        val_result = await resp.json()
                        if val_result.get("status") in ["VALID", "VALIDATED"]:
                            await db.get_collection(USER_COLLECTION).update_one(
                                {"_id": ObjectId(payment["user_id"])},
                                {"$set": {"user_type": "paid", "subscription": "premium"}}
                            )
                            await db.get_collection(PAYMENT_COLLECTION).update_one(
                                {"tran_id": tran_id},
                                {
                                    "$set": {
                                        "status": "success",
                                        "val_id": val_id,
                                        "payment_method": form_data.get("card_type", "Card/MFS"),
                                        "bank_tran_id": form_data.get("bank_tran_id"),
                                        "updated_at": datetime.utcnow()
                                    }
                                }
                            )
            except Exception as e:
                print(f"IPN validation error: {str(e)}")

    return {"status": "received"}


@router.get("/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    """
    Fetch all payment transactions for Admin Dashboard
    """
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    payments = await db.get_collection(PAYMENT_COLLECTION).find({}).sort("created_at", -1).to_list(length=100)
    
    formatted_payments = []
    for p in payments:
        formatted_payments.append({
            "id": str(p["_id"]),
            "user_id": p.get("user_id"),
            "user_name": p.get("user_name", "Unknown"),
            "user_email": p.get("user_email", "Unknown"),
            "tran_id": p.get("tran_id"),
            "amount": p.get("amount"),
            "plan": p.get("plan"),
            "status": p.get("status"),
            "payment_method": p.get("payment_method"),
            "created_at": p.get("created_at").isoformat() if p.get("created_at") else None
        })

    return {"success": True, "transactions": formatted_payments}
