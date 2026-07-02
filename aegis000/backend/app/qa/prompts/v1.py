"""QA scoring prompt, version 1.

Versioned as a Python module (not a template file) so revisions are
diffable and unit-testable. QAEngine records PROMPT_VERSION into the audit
log alongside every score, so a score is always traceable to the exact
prompt text that produced it.
"""

from __future__ import annotations

from app.qa.rubric import Rubric

PROMPT_VERSION = "qa-scoring-v1"

SYSTEM_PROMPT = (
    "You are an Aegis000 QA analyst scoring an Australian emergency (Triple "
    "Zero) call-taking transcript against a fixed rubric. Score strictly "
    "from the transcript provided. Respond with JSON only, no prose, "
    'matching this exact shape: {"criteria": [{"key": "<criterion_key>", '
    '"score": <0.0-1.0>, "rationale": "<one sentence>"}]}. Include exactly '
    "one entry per rubric criterion key provided."
)


def render(transcript_text: str, rubric: Rubric) -> str:
    criteria_lines = "\n".join(f"- {c.key}: {c.label} (weight {c.weight})" for c in rubric.criteria)
    return (
        f"Rubric: {rubric.name} (v{rubric.version})\n"
        f"Criteria:\n{criteria_lines}\n\n"
        f"Transcript:\n{transcript_text}\n\n"
        "Score every criterion listed above and return the JSON object described in your instructions."
    )
