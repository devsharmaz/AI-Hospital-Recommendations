from pinecone import Pinecone
from dotenv import load_dotenv
import os

class PineconeManager:
    def __init__(self):
        load_dotenv(override=True)
        self.pinecone_client = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        self.index_name = os.environ.get("PINECONE_INDEX")
        self.namespace = "hospital-namespace"

    def create_index(self):
        index_name = "hospital"
        if not self.pinecone_client.has_index(index_name):
            self.pinecone_client.create_index_for_model(
                name = index_name,
                cloud="aws",
                region="us-east-1",
                embed={
                    "model":"llama-text-embed-v2",
                    "field_map":{"text": "hospital_data"}
                }
            )

    def insert_data(self, records):
         # Target the index
        dense_index = self.pinecone_client.Index(self.index_name)

        # Upsert the records into a namespace
        dense_index.upsert_records(self.namespace, records)


    def query_index(self, user_query, top_k=10):
        dense_index = self.pinecone_client.Index(self.index_name)

        # Search the dense index
        search_results = dense_index.search(
            namespace=self.namespace,
            query={
                "top_k": top_k,
                "inputs": {
                    'text': user_query
                }
            }
        )

        query_results = []

        # Print the results
        for hit in search_results['result']['hits']:
                query_results.append(f"id: {hit['_id']:<5} | score: {round(hit['_score'], 2):<5} | text: {hit['fields']['hospital_data']:<50}")
        
        return query_results   
