# PerfTrace Failure Taxonomy

Use this reference only when the raw logs are not enough to rank hypotheses.

## Common anomaly buckets
- Missing close: parent or child span starts but never closes on error / cancel paths.
- Idle-in-span: a span wraps waiting, retry, or user-abandonment time instead of active work.
- Double counting: nested spans are reported as if their durations add to wall time.
- Late finalization: total operation finishes long after user-visible completion.
- Wrong ownership: a database / backend / preload span is tracking the wrong subsystem.
- Partial trace: the logged subset makes one span look dominant when earlier setup spans are missing.

## Interpretation cues
- `status=cancelled` with large total duration often means wall time includes abandonment or cleanup.
- One huge subsystem span with small child spans often suggests span boundaries are wrong.
- Slow total with normal child spans can indicate time outside measured children.
- Repeated near-threshold slow logs often indicate threshold formatting noise only if the comparison path differs from the print path.

## Good next probes
- Compare one success trace and one failure trace for the same operation.
- Check where each suspicious span starts and ends.
- Inspect cancellation, retry, and timeout paths for missing `end` / `finish` calls.
- Confirm whether one span wraps async handoff or callback wait time.
