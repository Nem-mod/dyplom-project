import os
from dotenv import load_dotenv

from llama_index.core import Document, VectorStoreIndex

from llama_index.llms.openai import OpenAI

load_dotenv()

llm = OpenAI(
    model="gpt-3.5-turbo",
    temperature=0.3,
    api_key=os.getenv("OPENAI_API_KEY")
)

def generate_llm_report(summary: dict) -> str:
    stats = summary.get("statistics", {})
    corr = summary.get("correlations", {})
    anomalies = summary.get("anomalies", [])

    content = f"""
    📊 Статистика: {stats}
    🔗 Кореляції: {corr}
    🚨 Аномалії: {len(anomalies)} записів

    Сформуй короткий аналітичний бізнес-звіт на основі цих даних. Зроби висновки та рекомендації.
    """

    # Створюємо документи
    documents = [Document(text=content)]

    # Простий векторний індекс (можна замінити на Faiss чи інше)
    index = VectorStoreIndex.from_documents(documents, llm=llm)

    # Виконуємо запит
    query_engine = index.as_query_engine()
    response = query_engine.query("Проаналізуй дані і згенеруй бізнес-звіт.")

    return str(response)
