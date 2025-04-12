import logging
import os
import sys
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.experimental.query_engine.pandas import PandasQueryEngine
from llama_index.core.tools import QueryEngineTool
from llama_index.llms.openai import OpenAI
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sklearn.preprocessing import MinMaxScaler

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))



class DataAnalyzer:
    def __init__(self, table_name: str, db_url: str):
        self.table_name = table_name
        self.engine = create_engine(db_url)
        self.df = self._load_data()
        self.cleaned_df = self._preprocess(self.df.copy()) if not self.df.empty else pd.DataFrame()
        self.table_name = table_name

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

    async def query(self, message):
        llm = OpenAI(
            model="gpt-3.5-turbo",
            temperature=0.3,
            api_key=os.getenv("OPENAI_API_KEY"))

        query_engine = PandasQueryEngine(df=self.df, verbose=True)
        query_engine_tools = [
            QueryEngineTool.from_defaults(
                query_engine=query_engine,
                name="table_query_tool",
                description=(
                    "Provides access to the data "
                ),
            ),
        ]
        agent = FunctionAgent(
            llm=llm,
            tools=query_engine_tools
        )

        return await agent.run(message)

