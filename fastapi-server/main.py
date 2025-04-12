from fastapi import FastAPI
from pydantic import BaseModel
from data_analyzer import DataAnalyzer
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



class Item(BaseModel):
    table_name: str
    message: str

@app.post("/analyze-my/")
async def analyze_table(item: Item):
    analyzer = DataAnalyzer(item.table_name, DB_URL)
    summary = await analyzer.query(item.message)

    return {
        "summary": summary,
    }


@app.get("/")
def root():
    return {"status": "OK"}
