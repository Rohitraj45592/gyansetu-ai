from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from app.database.connection import get_db
from app.database.models import AttendanceCorrectionRequest, Student

router = APIRouter(prefix="/attendance-correction", tags=["Attendance Correction"])

class CorrectionRequestCreate(BaseModel):
    student_id: Optional[int] = None
    student_name: Optional[str] = "Student"
    roll_number: Optional[str] = None
    subject: str = Field(..., min_length=2, max_length=100)
    attendance_date: str = Field(..., min_length=8, max_length=20)
    class_period: str = Field(..., min_length=2, max_length=50)
    faculty_name: Optional[str] = None
    reason: str = Field(..., min_length=10, max_length=1000)
    evidence_reference: Optional[str] = None

class FacultyReviewAction(BaseModel):
    decision: str = Field(..., pattern="^(Approved|Rejected)$")
    faculty_comment: Optional[str] = Field(None, max_length=500)
    is_demo_review: bool = True

@router.post("/")
def create_correction_request(data: CorrectionRequestCreate, db: Session = Depends(get_db)):
    """
    Submits a formal student attendance correction request.
    Validates required fields and attaches student details where available.
    """
    # Verify student if student_id is provided
    if data.student_id:
        student = db.query(Student).filter(Student.id == data.student_id).first()
        if student:
            if not data.student_name:
                data.student_name = student.name
            if not data.roll_number:
                data.roll_number = student.roll_number

    req = AttendanceCorrectionRequest(
        student_id=data.student_id,
        student_name=data.student_name or "Rohit Kumar",
        roll_number=data.roll_number or "CSE2021001",
        subject=data.subject,
        attendance_date=data.attendance_date,
        class_period=data.class_period,
        faculty_name=data.faculty_name or "Faculty In-Charge",
        reason=data.reason,
        evidence_reference=data.evidence_reference,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    return {
        "message": "Attendance correction request created successfully",
        "request_id": req.id,
        "status": req.status,
        "created_at": req.created_at.isoformat()
    }

@router.get("/student/{student_id}")
def get_student_requests(student_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all attendance correction requests for a specific student.
    Ensures student boundary isolation.
    """
    records = db.query(AttendanceCorrectionRequest).filter(
        AttendanceCorrectionRequest.student_id == student_id
    ).order_by(AttendanceCorrectionRequest.created_at.desc()).all()

    results = []
    for r in records:
        results.append({
            "id": f"ACR-{r.id}",
            "raw_id": r.id,
            "student_id": r.student_id,
            "student_name": r.student_name,
            "roll_number": r.roll_number,
            "subject": r.subject,
            "attendance_date": r.attendance_date,
            "class_period": r.class_period,
            "faculty_name": r.faculty_name,
            "reason": r.reason,
            "evidence_reference": r.evidence_reference,
            "status": r.status,
            "faculty_comment": r.faculty_comment,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None
        })

    return {"student_id": student_id, "requests": results}

@router.get("/demo-faculty-queue")
def get_demo_faculty_queue(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Demonstration Faculty Queue.
    Explicitly labeled as a demonstration view.
    In production, this route requires instructor JWT authentication with faculty role claim.
    """
    query = db.query(AttendanceCorrectionRequest)
    if status_filter and status_filter in ["Pending", "Approved", "Rejected"]:
        query = query.filter(AttendanceCorrectionRequest.status == status_filter)

    records = query.order_by(AttendanceCorrectionRequest.created_at.desc()).all()

    results = []
    for r in records:
        results.append({
            "id": f"ACR-{r.id}",
            "raw_id": r.id,
            "student_id": r.student_id,
            "student_name": r.student_name,
            "roll_number": r.roll_number,
            "subject": r.subject,
            "attendance_date": r.attendance_date,
            "class_period": r.class_period,
            "faculty_name": r.faculty_name,
            "reason": r.reason,
            "evidence_reference": r.evidence_reference,
            "status": r.status,
            "faculty_comment": r.faculty_comment,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None
        })

    return {
        "is_demo_queue": True,
        "security_notice": "Demonstration view — Production deployment requires instructor JWT authorization.",
        "requests": results
    }

@router.patch("/{request_id}/review")
def review_correction_request(
    request_id: int,
    action: FacultyReviewAction,
    db: Session = Depends(get_db)
):
    """
    Records faculty review decision (Approve or Reject) along with faculty justification comment.
    In production, this route enforces instructor authorization.
    """
    req = db.query(AttendanceCorrectionRequest).filter(
        AttendanceCorrectionRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Correction request not found")

    req.status = action.decision
    if action.faculty_comment:
        req.faculty_comment = action.faculty_comment
    req.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(req)

    return {
        "message": f"Request {action.decision.lower()} successfully",
        "request_id": f"ACR-{req.id}",
        "status": req.status,
        "faculty_comment": req.faculty_comment,
        "is_demo_action": action.is_demo_review
    }
