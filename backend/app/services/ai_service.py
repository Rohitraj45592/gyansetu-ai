from openai import OpenAI
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv
import os
import re

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

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
- Always filter by student_id = {student_id} for student-specific queries
- Return ONLY the SQL query, nothing else
- No markdown, no explanation, no backticks
- Use proper JOINs when needed

Question: {question}
SQL Query:
"""
    response = client.chat.completions.create(
        model="google/gemma-4-31b-it:free",
        messages=[{"role": "user", "content": prompt}]
    )
    sql = response.choices[0].message.content.strip()
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
    response = client.chat.completions.create(
        model="google/gemma-4-31b-it:free",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

def chat_with_ai(db: Session, question: str, student_id: int) -> dict:
    try:
        sql = generate_sql(question, student_id)
        data = execute_sql(db, sql)
        answer = generate_answer(question, data)
        return {
            "question": question,
            "answer": answer,
            "sql_used": sql,
            "data": data
        }
    except Exception as e:
        return {
            "question": question,
            "answer": f"Sorry, kuch problem aa gayi: {str(e)}",
            "sql_used": "",
            "data": []
        }