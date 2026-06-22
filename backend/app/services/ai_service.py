from google import genai
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv
import os
import re

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"

DB_SCHEMA = """
Tables in database:
1. users(id, email, role)
2. students(id, user_id, name, roll_number, department, semester)
3. subjects(id, name, code, semester, department)
4. attendance(id, student_id, subject_id, date, is_present)
5. marks(id, student_id, subject_id, exam_type, marks_obtained, total_marks)
6. timetable(id, subject_id, day, start_time, end_time, room, semester)
7. notices(id, title, content, created_at, category)
"""

def generate_sql(question: str, student_id: int) -> str:
    prompt = f"""
You are a SQL expert. Generate a PostgreSQL query based on the question.

Database Schema:
{DB_SCHEMA}

Rules:
- If the question is about the student's own academic data (attendance, marks, timetable, subjects, notices), generate ONLY the SQL query
- If the question is NOT related to academic data (general knowledge, casual chat, greetings, jokes, anything else), respond with EXACTLY this single word: NOT_ACADEMIC
- Always filter by student_id = {student_id} for student-specific queries
- Return ONLY the SQL query or the word NOT_ACADEMIC, nothing else
- No markdown, no explanation, no backticks
- Use proper JOINs when needed

Question: {question}
SQL Query:
"""
    response = client.models.generate_content(model=MODEL, contents=prompt)
    sql = response.text.strip()
    sql = re.sub(r'```sql|```', '', sql).strip()
    return sql

def execute_sql(db: Session, sql: str) -> list:
    try:
        result = db.execute(text(sql))
        rows = result.fetchall()
        columns = result.keys()
        return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return [{"error": str(e)}]

def generate_answer(question: str, data: list) -> str:
    prompt = f"""
You are GyanSetu AI, a helpful college ERP assistant.
Answer the student's question in a friendly, conversational way in Hinglish (mix of Hindi and English).

Question: {question}
Data from database: {data}

Rules:
- Be friendly and helpful
- Keep answer concise
- If data is empty, say no data found
- Format numbers nicely
- Use emojis occasionally
"""
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text.strip()

def generate_general_answer(question: str) -> str:
    prompt = f"""
You are GyanSetu AI, a friendly assistant for college students.
The student asked a general question that is NOT about their academic records (not attendance, marks, timetable, or notices).
Answer it helpfully and conversationally using your own knowledge, in Hinglish (mix of Hindi and English).

Question: {question}

Rules:
- Be friendly, warm, and helpful
- Keep the answer concise (2-4 sentences max)
- Use emojis occasionally
- You can gently remind them you're also able to answer academic questions (attendance, marks, timetable), but don't force it every time
"""
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text.strip()

def chat_with_ai(db: Session, question: str, student_id: int) -> dict:
    try:
        sql = generate_sql(question, student_id)

        if sql.strip().upper() == "NOT_ACADEMIC":
            answer = generate_general_answer(question)
            return {"question": question, "answer": answer, "sql_used": "", "data": []}

        data = execute_sql(db, sql)
        answer = generate_answer(question, data)
        return {"question": question, "answer": answer, "sql_used": sql, "data": data}
    except Exception as e:
        return {
            "question": question,
            "answer": f"Sorry, kuch problem aa gayi: {str(e)}",
            "sql_used": "",
            "data": []
        }