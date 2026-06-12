from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.ai_service import chat_with_ai
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    question: str
    student_id: int

@router.post("/")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    result = chat_with_ai(db, request.question, request.student_id)
    return result