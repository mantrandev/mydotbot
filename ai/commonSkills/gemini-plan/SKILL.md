---
name: gemini-plan
description: Use Gemini CLI to analyze codebase and output to geminiplan.md
args: [prompt]
---

Run the Gemini CLI command with the provided prompt and save output to geminiplan.md.

Execute: `gemini -p "${prompt}" > geminiplan.md`

After completion, inform the user that the analysis has been saved to geminiplan.md.
