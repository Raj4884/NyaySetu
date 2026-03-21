# Claude Project Instructions – NyaySetu

## Project Name
NyaySetu – Proactive Legal Insights & Case Prioritization System using AI/ML

## Project Overview
NyaySetu is an AI-driven decision-support system designed for the Indian judiciary.  
It focuses on two core functionalities:
1. Case Prioritization of pending court cases.
2. Proactive Law Impact Analysis of newly enacted or amended laws on ongoing cases.

The system assists judges, lawyers, and citizens through explainable AI insights while explicitly not replacing judicial discretion.

---

## Primary Objectives
- Reduce judicial backlog by intelligently prioritizing cases.
- Automatically analyze the impact of new or amended laws on pending cases.
- Provide transparent, explainable, and role-based legal insights.
- Deliver simplified legal explanations for non-technical users (citizens).

---

## Target Users
- Judges: View prioritized cases and law impact flags.
- Lawyers: Receive alerts on how new laws affect their active cases.
- Citizens: Understand law impacts in plain, non-technical language.

---

## Core Functional Modules

### 1. Case Prioritization Engine
- Input:
  - Case metadata from NJDG
  - Case text from NyayaAnumana / IndianKanoon
- Features:
  - Case age
  - Urgency indicators (bail, custody, injunction)
  - Case type (Civil, Criminal, Labour)
  - Social impact
- Output:
  - Priority score (High / Medium / Low)
  - Explainable reasoning for each score

---

### 2. Law Impact Analyzer
- Detects newly enacted or amended laws from:
  - Gazette of India
  - Parliament & Ministry of Law repositories
- Performs:
  - Law text preprocessing (sectioning, embeddings)
  - Case–law semantic matching
  - Statute overlap detection
- Generates:
  - Impact score (High / Medium / Low)
  - Dual summaries:
    - Lawyer View (technical, section-based)
    - Citizen View (plain language)

---

## AI / ML Guidelines

### Models & Techniques
- Transformer-based NLP models (e.g., INLegalLlama-inspired)
- Semantic embeddings for case–law similarity
- Hybrid approach:
  - Rule-based logic for initialization
  - ML refinement for predictions

### Explainability Rules (Very Important)
- Every output MUST include reasoning.
- No black-box decisions.
- Use:
  - Feature contribution explanations
  - Textual justification

---

## Legal & Ethical Constraints
- The system must NOT:
  - Predict final judgments as binding outcomes
  - Override judicial discretion
- The system MUST:
  - Act as an assistive decision-support tool only
  - Follow Indian legal ethics and data privacy norms
  - Avoid biased or speculative legal advice

---

## Data Sources
- NyayaAnumana Dataset (Indian legal cases)
- IndianKanoon.org (judgments and statutes)
- National Judicial Data Grid (case metadata)
- Gazette of India (law updates)

---

## Output Presentation Rules

### Role-Based Output
- Judges:
  - Prioritized case lists
  - Law impact flags
- Lawyers:
  - Case-specific amendment alerts
  - Technical legal explanations
- Citizens:
  - Simple explanations
  - No legal jargon

### Language Rules
- Lawyer View:
  - Formal legal terminology
  - Section and statute references
- Citizen View:
  - Simple English
  - Short sentences
  - Explain “what changes” and “what it means”

---

## Performance Expectations
- Scalable to handle crore-level cases.
- Low-latency processing for new law ingestion.
- High availability (dashboard reliability).

---

## Development Preferences
- Programming Language: Python
- Libraries:
  - HuggingFace Transformers
  - PyTorch / TensorFlow
- Databases:
  - MongoDB or PostgreSQL
- Architecture:
  - Modular
  - Easily extendable

---

## When Generating Content or Code
Claude should:
- Prefer clarity over complexity
- Use Indian legal context
- Reference sections and acts when relevant
- Avoid hallucinating legal facts
- Ask for clarification if legal ambiguity exists

---

## One-Line Guiding Principle
"NyaySetu bridges legal complexity and accessibility through explainable, ethical, and assistive AI."
