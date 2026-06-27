import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _send_email_sync(to_email: str, subject: str, html_content: str) -> bool:
        """
        Synchronous SMTP email sending logic.
        Runs inside a threadpool to prevent blocking the async loop.
        """
        # If no credentials, log the email to standard logger as dev mock
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            logger.info(
                "📧 [EMAIL MOCK LOG] SMTP not configured.\n"
                "-----------------------------------------\n"
                "To: %%s\n"
                "Subject: %%s\n"
                "Body:\n%%s\n"
                "-----------------------------------------",
                to_email, subject, html_content
            )
            return True

        try:
            # Create message container
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            # Attach HTML content
            part = MIMEText(html_content, "html", "utf-8")
            msg.attach(part)

            # Connect to SMTP Server
            # Standard TLS handshake on port 587
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            server.ehlo()
            server.starttls() # Secure connection
            server.ehlo()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            
            # Send and Close
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
            server.quit()
            logger.info("✅ Email sent successfully to %s", to_email)
            return True
        except Exception as exc:
            logger.error("❌ Failed to send email to %s: %s", to_email, exc, exc_info=True)
            return False

    @classmethod
    async def send_email(cls, to_email: str, subject: str, html_content: str) -> bool:
        """
        Asynchronously sends an email by running smtplib logic in a background thread.
        """
        return await asyncio.to_thread(cls._send_email_sync, to_email, subject, html_content)

    @classmethod
    async def send_verification_email(cls, to_email: str, name: str, token: str) -> bool:
        """
        Constructs and sends the email verification link.
        """
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        html_content = f"""
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid rgba(16,185,129,0.1); border-radius: 12px; background: #0b1320; color: #eff8f3;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #10b981; margin: 0; font-size: 28px;">🧠 Mentora</h2>
                <p style="color: #a8c0b5; margin: 4px 0 0 0; font-size: 14px;">মানসিক স্বাস্থ্য ও সুস্থতা সহায়িকা</p>
            </div>
            <div style="padding: 24px; background: rgba(255,255,255,0.02); border-radius: 8px;">
                <h3 style="color: #eff8f3; margin-top: 0;">হ্যালো, {name}!</h3>
                <p style="color: #c4d8cf; line-height: 1.6; font-size: 15px;">
                    মেন্টাল সাথী প্ল্যাটফর্মে রেজিস্ট্রেশন করার জন্য আপনাকে ধন্যবাদ। আপনার অ্যাকাউন্টটি সক্রিয় করতে দয়া করে নিচের বাটনে ক্লিক করে আপনার ইমেইল এড্রেসটি ভেরিফাই করুন:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verify_url}" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                        ইমেইল ভেরিফাই করুন
                    </a>
                </div>
                <p style="color: #a8c0b5; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
                    লিঙ্কটির মেয়াদ ১৫ মিনিট। বাটনটি কাজ না করলে নিচের লিঙ্কটি ব্রাউজারে কপি করে পেস্ট করুন:<br>
                    <a href="{verify_url}" style="color: #10b981; word-break: break-all;">{verify_url}</a>
                </p>
            </div>
            <div style="text-align: center; margin-top: 24px; color: #6b8f7f; font-size: 12px;">
                © {settings.APP_NAME}. সর্বস্বত্ব সংরক্ষিত।
            </div>
        </div>
        """
        return await cls.send_email(to_email, "Mentora - আপনার ইমেইল ভেরিফিকেশন লিঙ্ক", html_content)

    @classmethod
    async def send_password_reset_email(cls, to_email: str, name: str, token: str) -> bool:
        """
        Constructs and sends the password reset recovery link.
        """
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        html_content = f"""
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid rgba(16,185,129,0.1); border-radius: 12px; background: #0b1320; color: #eff8f3;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #10b981; margin: 0; font-size: 28px;">🧠 Mentora</h2>
                <p style="color: #a8c0b5; margin: 4px 0 0 0; font-size: 14px;">মানসিক স্বাস্থ্য ও সুস্থতা সহায়িকা</p>
            </div>
            <div style="padding: 24px; background: rgba(255,255,255,0.02); border-radius: 8px;">
                <h3 style="color: #eff8f3; margin-top: 0;">হ্যালো, {name}!</h3>
                <p style="color: #c4d8cf; line-height: 1.6; font-size: 15px;">
                    আমরা আপনার অ্যাকাউন্ট থেকে পাসওয়ার্ড রিসেট করার একটি অনুরোধ পেয়েছি। পাসওয়ার্ড রিসেট করতে দয়া করে নিচের বাটনে ক্লিক করুন:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                        পাসওয়ার্ড রিসেট করুন
                    </a>
                </div>
                <p style="color: #c4d8cf; line-height: 1.6; font-size: 15px;">
                    আপনি যদি এই অনুরোধ না করে থাকেন, তবে এই ইমেইলটি এড়িয়ে যান। লিঙ্কটির মেয়াদ ১৫ মিনিট।
                </p>
                <p style="color: #a8c0b5; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
                    বাটনটি কাজ না করলে নিচের লিঙ্কটি ব্রাউজারে কপি করে পেস্ট করুন:<br>
                    <a href="{reset_url}" style="color: #10b981; word-break: break-all;">{reset_url}</a>
                </p>
            </div>
            <div style="text-align: center; margin-top: 24px; color: #6b8f7f; font-size: 12px;">
                © {settings.APP_NAME}. সর্বস্বত্ব সংরক্ষিত।
            </div>
        </div>
        """
        return await cls.send_email(to_email, "Mentora - পাসওয়ার্ড রিসেট করার লিঙ্ক", html_content)


email_service = EmailService()
