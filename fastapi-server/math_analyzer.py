import learn
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from scipy.stats import zscore
from typing import Dict, Any, List
from sklearn.preprocessing import MinMaxScaler
class MathAnalyzer:
    def __init__(self, table_name: str, db_url: str):
        self.table_name = table_name
        self.engine = create_engine(db_url)
        self.df = self._load_data()
        self.cleaned_df = self._preprocess(self.df.copy()) if not self.df.empty else pd.DataFrame()

    def _load_data(self) -> pd.DataFrame:
        with self.engine.connect() as conn:
            result = conn.execute(text(f"SELECT data FROM {self.table_name}"))
            json_records = [row[0] for row in result if row[0] is not None]
        if not json_records:
            return pd.DataFrame()
        return pd.json_normalize(json_records)

    def _preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        df.dropna(axis=1, how='all', inplace=True)

        for col in df.select_dtypes(include=[np.number]).columns:
            df[col].fillna(df[col].median(), inplace=True)
            df[col] = MinMaxScaler().fit_transform(df[[col]])

        return df

    def describe(self) -> Dict[str, Any]:
        return self.cleaned_df.describe(include='all').to_dict()

    def detect_anomalies(self) -> List[Dict[str, Any]]:
        numeric = self.cleaned_df.select_dtypes(include=[np.number])
        if numeric.empty:
            return []
        z_scores = numeric.apply(zscore)
        mask = (z_scores.abs() > 3).any(axis=1)
        return self.df[mask].to_dict(orient='records')

    def detect_correlations(self) -> Dict[str, Dict[str, float]]:
        numeric = self.cleaned_df.select_dtypes(include=[np.number])
        if numeric.shape[1] < 2:
            return {}
        return numeric.corr().to_dict()

    def summarize(self) -> Dict[str, Any]:
        if self.df.empty:
            return {"error": "No data in table or invalid format."}

        return {
            "statistics": self.describe(),
            "correlations": self.detect_correlations(),
            "anomalies": self.detect_anomalies()
        }

    def generate_prompt(self) -> str:
        summary = self.summarize()
        if "error" in summary:
            return summary["error"]

        return f"""
        🔎 Аналітика з таблиці `{self.table_name}`:

        📊 Статистика:
        {summary['statistics']}

        🔗 Кореляції:
        {summary['correlations']}

        🚨 Аномалії:
        Знайдено {len(summary['anomalies'])} записів, які виглядають як аномальні.

        Згенеруй текстовий звіт для бізнес-аналітика на основі цих даних.
        """
