from fastapi import FastAPI
from math_analyzer import MathAnalyzer
from llm_reporter import generate_llm_report

app = FastAPI()
DB_URL = "postgresql://admin:adminpassword@timescaledb:5432/my_timescale_db"

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


@app.get("/")
def root():
    return {"status": "OK"}
