import pytest
from pydantic import ValidationError

from app.qa.rubric import load_rubric


def test_valid_rubric_loads():
    rubric = load_rubric("../rubrics/example-eso-v1.yaml")
    assert rubric.eso_id == "example-eso"
    assert len(rubric.criteria) == 5
    assert any(t.phrase == "knife" for t in rubric.keyword_triggers)


def test_rubric_rejects_weights_not_summing_to_one(tmp_path):
    bad_yaml = tmp_path / "bad.yaml"
    bad_yaml.write_text(
        """
eso_id: bad-eso
name: Bad Rubric
version: v1
criteria:
  - key: a
    label: A
    weight: 0.1
  - key: b
    label: B
    weight: 0.1
keyword_triggers: []
"""
    )
    with pytest.raises(ValidationError):
        load_rubric(bad_yaml)
