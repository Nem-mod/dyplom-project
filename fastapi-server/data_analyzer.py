import logging
import os
import sys
from pprint import pprint
from llama_index.core import set_global_handler
from llama_index.core.agent.workflow import FunctionAgent, AgentOutput
from llama_index.llms.openai import OpenAI
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
from sqlalchemy import create_engine, text
from sklearn.preprocessing import MinMaxScaler

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))
set_global_handler("simple")


class DataAnalyzer:
    def __init__(self, table_name: str, db_url: str):
        self.table_name = table_name
        self.engine = create_engine(db_url)
        self.df = self._load_data()
        self.cleaned_df = self._preprocess(self.df.copy()) if not self.df.empty else pd.DataFrame()
        self.table_name = table_name

    def _load_data(self) -> pd.DataFrame:
        with self.engine.connect() as conn:
            result = conn.execute(text(f"SELECT data, timestamp FROM {self.table_name}"))
            records = []
            for row in result:
                if row[0] is not None:
                    item = row[0]
                    item["Created At"] = row[1]
                    records.append(item)

        if not records:
            return pd.DataFrame()

        df = pd.json_normalize(records)
        return df

    def _preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        df.dropna(axis=1, how='all', inplace=True)

        # Автоматически приводим все, что можно, к числу
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='ignore')  # можно и 'coerce' если хочешь отбросить невалидное

        for col in df.select_dtypes(include=[np.number]).columns:
            df[col].fillna(df[col].median(), inplace=True)
            df[col] = MinMaxScaler().fit_transform(df[[col]])

        return df

    def build_system_prompt(self) -> str:
        all_columns = self.df.columns.tolist()
        numeric_columns = self.cleaned_df.select_dtypes(include=[np.number]).columns.tolist()

        return f""" 
You are a professional data analysis agent with access to structured event data extracted from a PostgreSQL database.
The data has been normalized from a JSONB column into a flat table format.

Your task is to independently analyze this dataset using the tools provided and produce a **single, well-structured, human-readable report** — as if written by a professional data analyst.

### Your responsibilities:
- Understand the structure and context of the data
- Identify the likely type of dataset (e.g., user behavior, logs, e-commerce, etc.)
- Select and invoke relevant tools automatically (no user instruction expected)
- Interpret the results clearly and professionally
- Present insights, observations, and hypotheses in a structured format
- Offer recommendations based on patterns and anomalies

### Dataset overview:
- Total columns: {len(all_columns)}
- Available columns: {', '.join(all_columns)}
- Numeric columns: {', '.join(numeric_columns) if numeric_columns else 'None'}

### Output format (strictly one report):
1. **Dataset Context** – What kind of data is this?
2. **Key Metrics** – Summary stats, data types, distributions
3. **Correlations & Relationships** – Significant variable relationships
4. **Outlier Analysis** – Anomalies and how they differ
5. **Clustering** – Distinct patterns or groupings
6. **Recommendations** – Next steps and suggestions

### Tone & Style Guidelines:
- Be clear, insightful, and human — like a data analyst writing for product managers or business stakeholders.
- Explain patterns and why they matter.
- Avoid overly technical terms unless they're clearly explained.
- Use bullet points and sections for clarity.
- Highlight anything surprising or counterintuitive.
- Do not list raw data or tables unless necessary.

### Available tools:
1. `describe_data()` – Summarize each column
2. `correlation_matrix()` – Show numeric relationships
3. `detect_outliers()` – Find anomalies via Isolation Forest
4. `perform_kmeans_clustering()` – Group data via KMeans
5. `linear_regression_summary()` – Fit linear model (target = numeric column)

You must call relevant tools as needed and return only one comprehensive report.
Final output write in HTML format so it can be inserted in existing html file. Do not use \\u \\n and familiar
"""

    async def describe_data(self) -> dict:
        """Provides descriptive statistics (mean, std, min, max, etc.) for each column."""
        return self.cleaned_df.describe(include='all').to_dict()

    async def correlation_matrix(self) -> dict:
        """Returns the correlation matrix of numeric columns to explore relationships."""
        return self.cleaned_df.corr().to_dict()

    async def detect_outliers(self, n_examples: int = 5) -> str:
        """
        Detects outliers using the Isolation Forest algorithm and returns a human-readable summary
        including a few example rows marked as anomalies.
        """
        model = IsolationForest(contamination=0.1)
        numeric = self.cleaned_df.select_dtypes(include=[np.number])

        if numeric.empty:
            return "No numeric columns available for outlier detection."

        predictions = model.fit_predict(numeric)
        self.cleaned_df['outlier'] = predictions

        total = len(predictions)
        outliers = self.cleaned_df[self.cleaned_df['outlier'] == -1]
        outlier_count = len(outliers)
        percentage = round(outlier_count / total * 100, 2)

        summary = (
            f"Outlier detection completed using the Isolation Forest algorithm.\n"
            f"- Total records analyzed: {total}\n"
            f"- Outliers detected: {outlier_count} ({percentage}% of the dataset)\n\n"
        )

        if outlier_count > 0:
            example_rows = outliers.head(n_examples).drop(columns=["outlier"]).to_dict(orient="records")
            summary += f"Here are {min(n_examples, outlier_count)} example(s) of detected anomalies:\n"
            for i, row in enumerate(example_rows, 1):
                summary += f"{i}. {row}\n"

        return summary

    async def perform_kmeans_clustering(self, n_clusters: int = 3) -> dict:
        """
        Performs KMeans clustering on numeric features and returns an interpretable summary.
        Works with any dataset, automatically infers numeric columns and explains cluster profiles.
        """

        numeric = self.cleaned_df.select_dtypes(include=[np.number])
        if numeric.empty:
            return {"error": "No numeric data available for clustering."}

        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.cleaned_df['cluster'] = kmeans.fit_predict(numeric)

        # Получаем метки кластеров и средние значения по каждому кластеру
        cluster_sizes = self.cleaned_df['cluster'].value_counts().sort_index().to_dict()
        cluster_centers = pd.DataFrame(kmeans.cluster_centers_, columns=numeric.columns).to_dict(orient="index")

        # Формируем описание
        explanations = []
        for cluster_id, center in cluster_centers.items():
            details = ", ".join(
                f"{feature}: {value:.3f}" for feature, value in center.items()
            )
            explanations.append(f"Cluster {cluster_id} ({cluster_sizes[cluster_id]} records): {details}")

        # Финальный отчёт
        summary = {
            "description": f"KMeans clustering applied to {numeric.shape[1]} numeric features "
                           f"over {numeric.shape[0]} records. {n_clusters} clusters found.",
            "cluster_sizes": cluster_sizes,
            "cluster_centers": cluster_centers,
            "explanation": explanations
        }

        return summary

    async def linear_regression_summary(self, target_col: str) -> dict:
        """
        Fits a linear regression model using the specified target column.
        Returns coefficients, intercept, and R-squared value.
        """
        numeric = self.cleaned_df.select_dtypes(include=[np.number])
        if target_col not in numeric.columns:
            return {"error": f"Column '{target_col}' not found or not numeric."}

        X = numeric.drop(columns=[target_col])
        y = numeric[target_col]

        model = LinearRegression()
        model.fit(X, y)

        return {
            "coefficients": dict(zip(X.columns, model.coef_)),
            "intercept": model.intercept_,
            "r_squared": model.score(X, y)
        }

    async def query(self, message):

        llm = OpenAI(
            model="gpt-4.1",
            temperature=1,

            api_key=os.getenv("OPENAI_API_KEY")
        )

        # query_engine = PandasQueryEngine(df=self.df, verbose=True)

        query_engine_tools = [
            # QueryEngineTool.from_defaults(
            #     query_engine=query_engine,
            #     name="table_query_tool",
            #     description="Provides access to the raw event data using Pandas DataFrame queries."
            # ),
            self.describe_data,
            self.correlation_matrix,
            self.detect_outliers,
            self.perform_kmeans_clustering,
            self.linear_regression_summary
        ]

        agent = FunctionAgent(
            llm=llm,
            tools=query_engine_tools,
            system_prompt=self.build_system_prompt()
        )

        response: AgentOutput = await agent.run(message)

        return response.response.blocks[0].text
        # return await self.perform_kmeans_clustering()
