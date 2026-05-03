# Diagnostics Playbook

Use this reference when a symptom spans more than one narrow artifact.

## Hypothesis ranking order
1. Recent change directly affecting the failing path.
2. Deterministic product regression visible in logs or output.
3. Broken instrumentation / logging making the symptom look worse or different.
4. Test harness / environment issue.
5. Low-confidence edge case with missing evidence.

## Evidence checklist
- What is directly observed?
- What is inferred from code shape or naming only?
- Which path is known to have executed?
- Which critical event is missing from the evidence?
- What comparison would reduce uncertainty fastest?

## Good next probes
- Compare success vs failure on the same path.
- Inspect the recent diff closest to the symptom boundary.
- Check timeout, cancellation, nil, or error branches.
- Ask for one more artifact only if it materially narrows the top hypotheses.
