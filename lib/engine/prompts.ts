export function buildCrossExamPrompt(
  originalPrompt: string,
  otherResponses: { name: string; text: string }[]
): string {
  const responsesText = otherResponses
    .map((r) => `[${r.name}]: "${r.text}"`)
    .join("\n\n");

  return `You are participating in an AI roundtable discussion. Here is the original question:
"${originalPrompt}"

Here are the responses from other AI participants:

${responsesText}

Now, please:
1. Identify the strongest points from each response
2. Point out any errors, gaps, or disagreements you see
3. Provide your improved, revised answer incorporating the best insights from all responses`;
}

export function buildDebatePrompt(
  originalPrompt: string,
  round1Responses: { name: string; text: string }[],
  round2Responses: { name: string; text: string }[]
): string {
  const r1Text = round1Responses
    .map((r) => `[${r.name}]: "${r.text}"`)
    .join("\n\n");
  const r2Text = round2Responses
    .map((r) => `[${r.name}]: "${r.text}"`)
    .join("\n\n");

  return `You are in the debate round of an AI roundtable discussion. The group has not yet reached consensus.

Original question: "${originalPrompt}"

Round 1 responses:
${r1Text}

Round 2 cross-examination responses:
${r2Text}

Focus on the remaining disagreements. Argue for your position with evidence and reasoning. Be concise but thorough. If you've changed your mind based on others' arguments, explain why.`;
}

export function buildSynthesisPrompt(
  originalPrompt: string,
  round1Responses: { name: string; text: string }[],
  round2Responses: { name: string; text: string }[],
  round2_5Responses?: { name: string; text: string }[]
): string {
  const r1Text = round1Responses
    .map((r) => `[${r.name}]: "${r.text}"`)
    .join("\n\n");
  const r2Text = round2Responses
    .map((r) => `[${r.name}]: "${r.text}"`)
    .join("\n\n");

  let debateSection = "";
  if (round2_5Responses && round2_5Responses.length > 0) {
    const r2_5Text = round2_5Responses
      .map((r) => `[${r.name}]: "${r.text}"`)
      .join("\n\n");
    debateSection = `\n\nDebate round responses:\n${r2_5Text}`;
  }

  return `You are the final synthesizer in an AI roundtable. Multiple AI models have independently answered the same question, then cross-examined each other. Your job is to merge ALL of their perspectives into one cohesive, unified answer — not to pick a winner.

Original question: "${originalPrompt}"

Round 1 independent responses:
${r1Text}

Round 2 cross-examination responses:
${r2Text}${debateSection}

Produce a single, well-structured answer that:
- Weaves together insights and perspectives from EVERY participant — do not ignore or discard any model's contribution
- Where models agree, present the shared conclusion confidently
- Where models disagree, present the different viewpoints fairly and explain the trade-offs rather than just picking one
- Integrates unique points that only one model raised — these are often the most valuable additions
- Flags genuine uncertainties honestly
- Reads as one coherent, complete answer (not a list of "Model A said X, Model B said Y")
- Is clear, thorough, and directly answers the user's question`;
}
