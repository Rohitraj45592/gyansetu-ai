from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Attendance, Student, Subject

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("/{student_id}")
def get_attendance(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).all()
    
    subject_wise = {}
    for record in attendance_records:
        subject = db.query(Subject).filter(Subject.id == record.subject_id).first()
        subject_name = subject.name if subject else "Unknown"
        
        if subject_name not in subject_wise:
            subject_wise[subject_name] = {"present": 0, "total": 0}
        
        subject_wise[subject_name]["total"] += 1
        if record.is_present:
            subject_wise[subject_name]["present"] += 1
    
    result = []
    for subject, data in subject_wise.items():
        percentage = (data["present"] / data["total"] * 100) if data["total"] > 0 else 0
        result.append({
            "subject": subject,
            "present": data["present"],
            "total": data["total"],
            "percentage": round(percentage, 2),
            "status": "Safe" if percentage >= 75 else "Low"
        })
    
    return {"student_id": student_id, "attendance": result}