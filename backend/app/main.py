from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
from app.database import models
from app.api import auth, attendance, marks, timetable, student, chat

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GyanSetu AI",
    description="GenAI-powered ERP Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(marks.router)
app.include_router(timetable.router)
app.include_router(student.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "GyanSetu AI Backend is running!", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "project": "GyanSetu AI"}