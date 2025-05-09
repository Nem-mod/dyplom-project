from pprint import pprint

from fastapi import FastAPI
from pydantic import BaseModel
from data_analyzer import DataAnalyzer
from math_analyzer import MathAnalyzer
from llm_reporter import generate_llm_report
from weasyprint import HTML
from jinja2 import Template
import datetime
import json
import markdown
import smtplib
import os
from email.message import EmailMessage

def markdown_to_html(text: str) -> str:
    # Декодируем Unicode-escape, если текст выглядит как \u0417\u0432...
    try:
        text = text.encode('utf-8').decode('unicode_escape')
    except UnicodeDecodeError:
        pass  # если уже декодировано — просто игнорируем

    # Заменим \n на реальные переводы строк
    normalized_text = text.replace("\\n", "\n") if "\\n" in text else text
    return markdown.markdown(normalized_text, extensions=["extra"])

app = FastAPI()
DB_URL = "postgresql://admin:adminpassword@timescaledb:5432/my_timescale_db"


# DB_URL = "postgresql://admin:adminpassword@localhost:5433/my_timescale_db"
@app.get("/analyze/{table_name}")
def analyze_table(table_name: str):
    analyzer = MathAnalyzer(table_name, DB_URL)
    summary = analyzer.summarize()

    if "error" in summary:
        return summary

    llm_output = generate_llm_report(summary)
    return {
        "summary": summary,
        "llm_output": llm_output
    }


class Item(BaseModel):
    table_name: str
    message: str


@app.post("/analyze-my/")
async def analyze_table(item: Item):
    analyzer = DataAnalyzer(item.table_name, DB_URL)
    summary = await analyzer.query(item.message)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_file = f"/app/reports/report-{timestamp}.pdf"
    save_analysis_report_to_pdf(json.dumps(summary), report_file)
    send_pdf_report_via_email(
        pdf_path=report_file,
        subject="📊 Ваш аналитический отчёт готов",
        body="Отчёт по данным был успешно сформирован. Он приложен в PDF-формате.",
        to_email="necha.enemy@gmail.com",
        from_email="necha.enemy@gmail.com",
        smtp_host="smtp.gmail.com",
        smtp_port=465,
        smtp_user="necha.enemy@gmail.com",
        smtp_password=os.getenv('SMPTP') # Используй App Password, не обычный пароль!
    )
    return {
        "summary": summary,
    }


def save_analysis_report_to_pdf(report_text: str, output_path: str = "/app/reports/analysis_report.pdf"):
    # Простейший шаблон HTML
    html_template = Template("""
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: sans-serif; padding: 2em; }
            h1, h2 { color: #2c3e50; }
            pre { background-color: #f5f5f5; padding: 1em; border-radius: 4px; }
        </style>
    </head>
    <body>
        <h1>Data Analysis Report</h1>
        <p><em>Generated: {{ date }}</em></p>
        <div>{{ report }}</div>
    </body>
    </html>
    """)

    # Подставим содержимое отчёта
    html_content = html_template.render(
        report=markdown_to_html(report_text),
        date=datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    )

    # Сохраняем в PDF
    HTML(string=html_content).write_pdf(output_path)

def send_pdf_report_via_email(
    pdf_path: str,
    subject: str,
    body: str,
    to_email: str,
    from_email: str,
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str
):
    # Создаём письмо
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(body)

    # Прикрепляем PDF
    with open(pdf_path, "rb") as f:
        file_data = f.read()
        file_name = os.path.basename(pdf_path)
        msg.add_attachment(file_data, maintype="application", subtype="pdf", filename=file_name)

    # Отправляем письмо
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as smtp:
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(msg)

    print(f"✅ PDF sent to {to_email}")

@app.get("/")
def root():
    return {"status": "OK"}
