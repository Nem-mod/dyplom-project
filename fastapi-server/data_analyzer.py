from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.vector_stores.postgres import PGVectorStore
from sqlalchemy import make_url

class DataAnalyzer:
    def __init__(self, table_name: str, db_url: str):
        url = make_url(db_url)
        self.table_name = table_name
        vector_store = PGVectorStore.from_params(
            database='my_timescale_db',
            host=url.host,
            password=url.password,
            port=url.port,
            user=url.username,
            table_name=table_name,
            embed_dim=1536,  # openai embedding dimension
            hnsw_kwargs={
                "hnsw_m": 16,
                "hnsw_ef_construction": 64,
                "hnsw_ef_search": 40,
                "hnsw_dist_method": "vector_cosine_ops",
            },
        )
        self.index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store, show_progress=True
        )
    def query(self, message):
        query_engine = self.index.as_query_engine()
        return query_engine.query(message)

DataAnalyzer('dashboard_4')