from transformers import pipeline
import torch

class NLPService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NLPService, cls).__new__(cls)
            # Initialize models
            try:
                # Embedding model for semantic matching
                cls._instance.embedder = pipeline("feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2")
                # Summarization model (using a smaller, efficient T5 model for dual views)
                cls._instance.summarizer = pipeline("summarization", model="t5-small")
            except Exception as e:
                print(f"NLP Model Initialization Error: {e}")
                cls._instance.embedder = None
                cls._instance.summarizer = None
        return cls._instance

    def get_embeddings(self, text):
        if not self.embedder:
            return [0] * 384
        
        # Truncate text to avoid model limits
        truncated_text = text[:512]
        outputs = self.embedder(truncated_text)
        embeddings = torch.mean(torch.tensor(outputs[0]), dim=0)
        return embeddings.tolist()

    def extract_legal_sections(self, text):
        """
        Regex-based extraction of legal sections (e.g., Section 41A, Article 21).
        """
        import re
        # Match "Section 123", "Section 123A", "Sec. 123", "Article 123"
        patterns = [
            r"Section\s+\d+[A-Z]*",
            r"Sec\.\s+\d+[A-Z]*",
            r"Article\s+\d+[A-Z]*",
            r"Clauses?\s+\d+[A-Z]*"
        ]
        combined_pattern = "|".join(patterns)
        matches = re.findall(combined_pattern, text, re.IGNORECASE)
        # De-duplicate and normalize
        return list(set([m.strip().title() for m in matches]))

    def generate_summaries(self, text, context=None):
        """
        Humanized Generation: Produces natural, advisory language for legal updates.
        """
        if not self.summarizer:
            return self._fallback_summaries(text)

        try:
            # Stage 1: Core Statutory Extraction
            statute_prompt = f"Summarize this legal text simply: {text[:600]}"
            base_summary = self.summarizer(statute_prompt, max_length=150, min_length=40, do_sample=False)[0]['summary_text']
            
            # Stage 2: Contextual Analysis Logic
            advice_note = "This update introduces modern digital standards for handling legal evidence."
            if "bns" in text.lower() or "nyaya" in text.lower():
                advice_note = "This includes a focus on modern definitions of community safety and updated consequences for certain offenses."
            elif "nagarik" in text.lower() or "bnss" in text.lower():
                advice_note = "This change specifically shortens the time allowed for completing investigations to help cases move through the courts faster."
            
            # Stage 3: Clean, Narrative Outputs
            sections = self.extract_legal_sections(text)
            section_note = f" affecting {', '.join(sections[:3])}" if sections else ""
            
            lawyer_summary = f"ADMINISTRATIVE ALERT: This enactment{section_note} introduces {base_summary}. {advice_note} Practitioners should evaluate procedural compliance under the new statutory framework."
            
            citizen_summary = f"Important Update: {base_summary.split('.')[0].capitalize()}. {advice_note} This means the rules for cases like yours have changed to be more modern and efficient."
            
            return lawyer_summary, citizen_summary
        except Exception as e:
            print(f"XAI Generation Error: {e}")
            return self._fallback_summaries(text)

    def _fallback_summaries(self, text):
        return (
            f"Note: This update involves changes to {text[:100]}... and should be reviewed for procedural alignment.",
            f"A quick update: New changes have been introduced regarding {text[:100]}... that may affect how your matter is handled."
        )
