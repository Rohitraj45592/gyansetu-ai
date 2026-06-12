from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Marks, Student, Subject

router = APIRouter(prefix="/marks", tags=["Marks"])

@router.get("/{student_id}")
def get_marks(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    marks_records = db.query(Marks).filter(
        Marks.student_id == student_id
    ).all()
    
    result = []
    for record in marks_records:
        subject = db.query(Subject).filter(Subject.id == record.subject_id).first()
        result.append({
            "subject": subject.name if subject else "Unknown",
            "exam_type": record.exam_type,
            "marks_obtained": record.marks_obtained,
            "total_marks": record.total_marks,
            "percentage": round((record.marks_obtained / record.total_marks) * 100, 2)
        })
    
    return {"student_id": student_id, "marks": result}