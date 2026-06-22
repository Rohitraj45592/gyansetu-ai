from google import genai
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv
import os
import re

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"

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

def chat_with_ai(db: Session, question: str, student_id: int) -> dict:
    try:
        prompt = f"""
You are GyanSetu AI, a helpful college ERP assistant.

Database Schema:
{DB_SCHEMA}

Student ID: {student_id}

The student asked: "{question}"

Step 1: Decide if this question is about the student's academic data (attendance, marks, timetable, subjects, notices) or a general/casual question.

Step 2A: If it IS about academic data:
- Generate a PostgreSQL query to fetch the relevant data
- Always filter by student_id = {student_id}
- Use proper JOINs when needed
- Return your response in this exact format:
SQL: <your sql query here>
ANSWER: <friendly Hinglish answer using the data>

Step 2B: If it is NOT about academic data (general knowledge, jokes, greetings, casual chat):
- Answer it directly from your knowledge in friendly Hinglish
- Return your response in this exact format:
SQL: NONE
ANSWER: <your friendly Hinglish answer>

Rules:
- Be warm, friendly, conversational
- Use emojis occasionally
- Keep answers concise
- For academic answers, mention actual numbers/data
"""
        response = client.models.generate_content(model=MODEL, contents=prompt)
        raw = response.text.strip()

        # Parse SQL and ANSWER from response
        sql_match = re.search(r'SQL:\s*(.*?)(?=ANSWER:|$)', raw, re.DOTALL | re.IGNORECASE)
        answer_match = re.search(r'ANSWER:\s*(.*?)$', raw, re.DOTALL | re.IGNORECASE)

        sql = sql_match.group(1).strip() if sql_match else "NONE"
        answer = answer_match.group(1).strip() if answer_match else raw

        sql = re.sub(r'```sql|```', '', sql).strip()

        # If SQL exists and is not NONE, execute it and regenerate answer with real data
        if sql.upper() != "NONE" and sql:
            try:
                result = db.execute(text(sql))
                rows = result.fetchall()
                columns = result.keys()
                data = [dict(zip(columns, row)) for row in rows]

                # Use data to make answer more accurate (one more call only if needed)
                if data and answer and "{data}" not in answer:
                    # Answer already generated, just return it
                    pass
                
            except Exception as e:
                data = [{"error": str(e)}]
        else:
            data = []
            sql = ""

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