import pytest

from app.qa.llm_client import MockScoringModel
from app.qa.rubric import load_rubric
from app.qa.scorer import QAEngine, QAParsingError
from app.transcription.mock_adapter import MockTranscriptionAdapter


@pytest.fixture
def loaded_rubric():
    return load_rubric("../rubrics/example-eso-v1.yaml")


@pytest.mark.asyncio
async def test_scoring_is_deterministic(loaded_rubric):
    adapter = MockTranscriptionAdapter()
    transcript = await adapter.transcribe("000-mock-001")
    engine = QAEngine(MockScoringModel())

    first = engine.score_call(transcript, loaded_rubric)
    second = engine.score_call(transcript, loaded_rubric)

    assert first.overall_score == second.overall_score
    assert [c.score for c in first.criterion_scores] == [c.score for c in second.criterion_scores]


@pytest.mark.asyncio
async def test_all_rubric_criteria_are_scored(loaded_rubric):
    adapter = MockTranscriptionAdapter()
    transcript = await adapter.transcribe("000-mock-002")
    engine = QAEngine(MockScoringModel())

    result = engine.score_call(transcript, loaded_rubric)

    scored_keys = {c.key for c in result.criterion_scores}
    expected_keys = {c.key for c in loaded_rubric.criteria}
    assert scored_keys == expected_keys


def test_malformed_output_raises_qa_parsing_error(loaded_rubric):
    class BrokenModel:
        model_name = "broken"
        model_version = "0"

        def generate(self, input):
            from llm.core.types import LLMOutput

            return LLMOutput(content="not json at all")

    engine = QAEngine(BrokenModel())
    from app.transcription.interface import TranscriptResult

    empty_transcript = TranscriptResult(call_id="x", segments=[], adapter_name="t", adapter_version="1")
    with pytest.raises(QAParsingError):
        engine.score_call(empty_transcript, loaded_rubric)
