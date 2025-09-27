from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
from datetime import datetime, date, time, timedelta
from typing import Optional, List
from uuid import uuid4, UUID
from enum import Enum
import sqlite3

# Database setup
DATABASE_URL = "sqlite:///./appointments.db"
engine = create_engine(DATABASE_URL, echo=True)

# Enums
class AppointmentType(str, Enum):
    REGULAR_CHECKUP = "Regular Check-up"
    SPECIFIC_TREATMENT = "Specific Treatment"
    OPERATION = "Operation"

class AppointmentStatus(str, Enum):
    BOOKED = "booked"
    CANCELLED = "cancelled"

# Models
class Appointment(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    patient_name: str
    contact_info: str
    appointment_type: AppointmentType
    duration_minutes: int
    start_datetime: datetime
    end_datetime: datetime
    status: AppointmentStatus = AppointmentStatus.BOOKED

class AppointmentCreate(SQLModel):
    patient_name: str
    contact_info: str
    appointment_type: AppointmentType
    start_datetime: datetime

class AppointmentResponse(SQLModel):
    id: str
    patient_name: str
    contact_info: str
    appointment_type: AppointmentType
    duration_minutes: int
    start_datetime: datetime
    end_datetime: datetime
    status: AppointmentStatus
    
    class Config:
        from_attributes = True

class SlotResponse(SQLModel):
    start_time: str
    end_time: str
    available: bool

# FastAPI app
app = FastAPI(title="Dentist Appointment Booking API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database session dependency
def get_session():
    with Session(engine) as session:
        yield session

# Helper functions
def get_duration_for_type(appointment_type: AppointmentType) -> int:
    duration_map = {
        AppointmentType.REGULAR_CHECKUP: 30,
        AppointmentType.SPECIFIC_TREATMENT: 60,
        AppointmentType.OPERATION: 120
    }
    return duration_map[appointment_type]

def generate_time_slots(target_date: date) -> List[datetime]:
    """Generate all possible 15-minute slots between 09:30 and 20:00"""
    slots = []
    start_time = datetime.combine(target_date, time(9, 30))
    end_time = datetime.combine(target_date, time(20, 0))
    
    current_time = start_time
    while current_time < end_time:
        slots.append(current_time)
        current_time += timedelta(minutes=15)
    
    return slots

def is_lunch_break(slot_time: datetime) -> bool:
    """Check if slot overlaps with lunch break (13:00-14:00)"""
    lunch_start = time(13, 0)
    lunch_end = time(14, 0)
    slot_time_only = slot_time.time()
    return lunch_start <= slot_time_only < lunch_end

def check_slot_availability(
    start_time: datetime, 
    duration: int, 
    existing_appointments: List[Appointment]
) -> bool:
    """Check if a slot is available (no overlap with existing appointments)"""
    end_time = start_time + timedelta(minutes=duration)
    
    # Working hours
    work_start = datetime.combine(start_time.date(), time(9, 30))
    work_end = datetime.combine(start_time.date(), time(20, 0))

    # Check if slot is in the past
    if start_time < datetime.now():
        return False

    # Enforce 15-minute granularity
    if start_time.minute % 15 != 0 or start_time.second != 0 or start_time.microsecond != 0:
        return False

    # Enforce working window boundaries
    if not (work_start <= start_time and end_time <= work_end):
        return False

    # Check lunch break overlap
    current_time = start_time
    while current_time < end_time:
        if is_lunch_break(current_time):
            return False
        current_time += timedelta(minutes=15)

    # Check overlap with existing appointments
    for appointment in existing_appointments:
        if appointment.status == AppointmentStatus.CANCELLED:
            continue
            
        # Check if there's any overlap
        if (start_time < appointment.end_datetime and 
            end_time > appointment.start_datetime):
            return False
    
    return True

# API Endpoints
@app.on_event("startup")
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@app.get("/")
def read_root():
    return {"message": "Dentist Appointment Booking API"}

@app.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(date: str, session: Session = Depends(get_session)):
    """Get all appointments for a specific date"""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get appointments for the specific date
    start_of_day = datetime.combine(target_date, time.min)
    end_of_day = datetime.combine(target_date, time.max)
    
    statement = select(Appointment).where(
        Appointment.start_datetime >= start_of_day,
        Appointment.start_datetime <= end_of_day,
        Appointment.status == AppointmentStatus.BOOKED
    )
    appointments = session.exec(statement).all()
    
    return [AppointmentResponse.model_validate(appointment, from_attributes=True) for appointment in appointments]

@app.get("/allAvailableSlots")
def get_available_slots(date: str, type: AppointmentType, session: Session = Depends(get_session)):
    """Get all available slots for a specific date and appointment type"""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    duration = get_duration_for_type(type)
    
    # Get existing appointments for the date
    start_of_day = datetime.combine(target_date, time.min)
    end_of_day = datetime.combine(target_date, time.max)
    
    statement = select(Appointment).where(
        Appointment.start_datetime >= start_of_day,
        Appointment.start_datetime <= end_of_day
    )
    existing_appointments = session.exec(statement).all()
    
    # Generate all possible slots
    all_slots = generate_time_slots(target_date)
    available_slots = []
    
    for slot in all_slots:
        # Check if this slot can accommodate the appointment duration
        if slot + timedelta(minutes=duration) > datetime.combine(target_date, time(20, 0)):
            continue
            
        if check_slot_availability(slot, duration, existing_appointments):
            end_time = slot + timedelta(minutes=duration)
            available_slots.append({
                "start_time": slot.strftime("%H:%M"),
                "end_time": end_time.strftime("%H:%M"),
                "available": True
            })
    
    return available_slots

@app.post("/appointments", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, session: Session = Depends(get_session)):
    """Create a new appointment"""
    duration = get_duration_for_type(appointment.appointment_type)
    end_datetime = appointment.start_datetime + timedelta(minutes=duration)
    
    # Get existing appointments for validation
    appointment_date = appointment.start_datetime.date()
    start_of_day = datetime.combine(appointment_date, time.min)
    end_of_day = datetime.combine(appointment_date, time.max)
    
    statement = select(Appointment).where(
        Appointment.start_datetime >= start_of_day,
        Appointment.start_datetime <= end_of_day
    )
    existing_appointments = session.exec(statement).all()
    
    # Validate slot availability
    if appointment.start_datetime.minute % 15 != 0 or appointment.start_datetime.second != 0 or appointment.start_datetime.microsecond != 0:
        raise HTTPException(status_code=400, detail="Start time must align to a 15-minute boundary (e.g., 09:30, 09:45, 10:00)")
    if not check_slot_availability(appointment.start_datetime, duration, existing_appointments):
        raise HTTPException(status_code=400, detail="Selected time slot is not available")
    
    # Create new appointment
    db_appointment = Appointment(
        patient_name=appointment.patient_name,
        contact_info=appointment.contact_info,
        appointment_type=appointment.appointment_type,
        duration_minutes=duration,
        start_datetime=appointment.start_datetime,
        end_datetime=end_datetime,
        status=AppointmentStatus.BOOKED
    )
    
    session.add(db_appointment)
    session.commit()
    session.refresh(db_appointment)
    
    return AppointmentResponse.model_validate(db_appointment, from_attributes=True)

@app.delete("/appointments/{appointment_id}")
def cancel_appointment(appointment_id: str, session: Session = Depends(get_session)):
    """Cancel an appointment"""
    statement = select(Appointment).where(Appointment.id == appointment_id)
    appointment = session.exec(statement).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = AppointmentStatus.CANCELLED
    session.add(appointment)
    session.commit()
    
    return {"message": "Appointment cancelled successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
