const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const MAX_TOKENS = 1024

/**
 * Core chat helper — sends messages to Groq and returns the reply string.
 * @param {{ apiKey: string, systemPrompt: string, messages: Array<{role:string,content:string}> }} opts
 * @returns {Promise<string>}
 */
export async function chat({ apiKey, systemPrompt, messages }) {
  if (!apiKey) throw new Error('Groq API key not set.')

  const payload = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

/**
 * Summarise a single note using Groq.
 */
export async function summariseNote({ apiKey, note }) {
  const systemPrompt =
    'You are a concise note summariser. Reply with a 2–3 sentence summary only.'
  const messages = [
    {
      role: 'user',
      content: `Summarise this note titled "${note.title}":\n\n${note.body || '(no body)'}`,
    },
  ]
  return chat({ apiKey, systemPrompt, messages })
}

/**
 * Suggest next steps for a goal.
 */
export async function suggestGoalSteps({ apiKey, goal }) {
  const systemPrompt =
    'You are a productive life coach. Provide 3–5 actionable next steps, short and numbered.'
  const messages = [
    {
      role: 'user',
      content: `Goal: "${goal.title}". Progress: ${goal.progress}/${goal.target} ${goal.unit}. Status: ${goal.status}. Suggest next steps.`,
    },
  ]
  return chat({ apiKey, systemPrompt, messages })
}

/**
 * Build a rich system prompt from the user's data.
 */
export function buildSystemPrompt({ user, notes = [], goals = [] }) {
  const notesSummary =
    notes.length === 0
      ? 'No notes yet.'
      : notes
          .slice(0, 20) // cap to avoid token overflow
          .map((n) => `- [${n.tag}] ${n.title}: ${(n.body || '').slice(0, 120)}`)
          .join('\n')

  const goalsSummary =
    goals.length === 0
      ? 'No goals yet.'
      : goals
          .map(
            (g) =>
              `- ${g.title} (${g.progress}/${g.target} ${g.unit}, ${g.status}, due: ${g.due || 'no date'})`
          )
          .join('\n')

  return `You are Loco AI — a personal productivity assistant built into the Loco app.
The user's name is ${user?.user_metadata?.full_name || user?.email || 'there'}.

USER NOTES:
${notesSummary}

USER GOALS:
${goalsSummary}

Keep responses helpful, concise, and friendly. Use markdown for formatting when useful.`
}
