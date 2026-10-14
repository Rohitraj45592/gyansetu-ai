from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.ai_service import chat_with_ai, chat_with_file_context
from pydantic import BaseModel
import io

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    question: str
    student_id: int

# ─── Existing — bilkul same ───────────────────────────────────
@router.post("/")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    result = chat_with_ai(db, request.question, request.student_id)
    return result

# ─── NAYA — Image ─────────────────────────────────────────────
@router.post("/image/")
async def chat_with_image(
    question: str = Form(...),
    student_id: int = Form(...),
    file: UploadFile = File(...),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Sirf image files allowed hain")

    contents = await file.read()

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image 5MB se badi nahi honi chahiye")

    image_context = f"""
Student ne ek image share ki hai.
File name: {file.filename}
File type: {file.content_type}
Student ka sawaal: {question}
Image directly dekh nahi sakta — sawaal ke basis pe helpful response do.
"""
    answer = chat_with_file_context(question, image_context, file.filename)
    return {"question": question, "answer": answer, "sql_used": "", "data": []}

# ─── NAYA — PDF / File ────────────────────────────────────────
@router.post("/file/")
async def chat_with_file(
    question: str = Form(...),
    student_id: int = Form(...),
    file: UploadFile = File(...),
):
    contents = await file.read()
    extracted_text = ""

    if file.content_type == "application/pdf":
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"
        except Exception as e:
            extracted_text = f"[PDF read nahi hua: {str(e)}]"

    elif file.content_type == "text/plain":
        extracted_text = contents.decode("utf-8", errors="ignore")

    else:
        extracted_text = f"[{file.filename} — Word files abhi supported nahi. PDF try karo.]"

    if len(extracted_text) > 4000:
        extracted_text = extracted_text[:4000] + "...[truncated]"

    if not extracted_text.strip():
        extracted_text = "[File se text extract nahi hua]"

    answer = chat_with_file_context(question, extracted_text, file.filename)
    return {"question": question, "answer": answer, "sql_used": "", "data": []}