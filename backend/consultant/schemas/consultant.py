from pydantic import BaseModel, Field
from typing import List, Optional

class ConsultantResponse(BaseModel):
    id: str
    name: str
    name_bn: Optional[str]
    degree: str
    specialization: List[str]
    experience_years: int
    division: str
    district: Optional[str]
    address: Optional[str]
    fee: int
    rating: float
    total_reviews: int
    available_days: List[str]
    available_time_start: str
    available_time_end: str
    online_available: bool
    phone: Optional[str]
    email: Optional[str]
    bio: Optional[str]
    bio_bn: Optional[str]
    image: str

class BookingRequest(BaseModel):
    consultant_id: str
    date: str
    time: str
    type: str = "online"
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    success: bool
    message: str
    booking_id: Optional[str] = None
    meeting_link: Optional[str] = None

class ReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=500)

class ReviewResponse(BaseModel):
    success: bool
    message: str

class ConsultantsListResponse(BaseModel):
    success: bool
    consultants: List[ConsultantResponse]
    total: int
    page: int
    limit: int
