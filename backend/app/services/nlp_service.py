from transformers import pipeline
import torch

class NLPService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NLPService, cls).__new__(cls)
            # Initialize embedding model (using a lightweight one for demo)
            try:
                cls._instance.embedder = pipeline("feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2")
            except Exception:
                cls._instance.embedder = None
        return cls._instance

    def get_embeddings(self, text):
        if not self.embedder:
            return [0] * 384 # Default size for MiniLM
        
        # Get mean pooling of hidden states
        outputs = self.embedder(text)
        embeddings = torch.mean(torch.tensor(outputs[0]), dim=0)
        return embeddings.tolist()

    def generate_summaries(self, text):
        """
        Generates dual summaries (Lawyer vs Citizen).
        Simulated for now with keyword-based extraction or simple truncation.
        """
        lawyer_summary = f"TECHNICAL MEMORANDUM: Legal analysis of '{text[:100]}...' under prevailing statutes."
        citizen_summary = f"IN PLAIN ENGLISH: What you need to know about the new changes in '{text[:100]}...'."
        
        return lawyer_summary, citizen_summary
