// AI Analysis Library
// Provides mock streaming AI responses — swap OPENAI_API_KEY in .env.local for real responses
// Uses Server-Sent Events (SSE) style streaming via ReadableStream

export interface AnalysisResult {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  riskScore: number         // 0-100 (lower = safer)
  marketViability: 'LOW' | 'MEDIUM' | 'HIGH'
  revenueEstimate: string
  competitorSummary: string
}

// Build a prompt from a room's nodes
export function buildAnalysisPrompt(nodes: { type: string; label: string; content?: string | null }[]) {
  const nodeList = nodes
    .map((n) => `- [${n.type}] ${n.label}${n.content ? `: ${n.content}` : ''}`)
    .join('\n')
  return `Analyze this business idea with the following components:\n${nodeList}`
}

// Stream a mock analysis response — chunk by chunk to simulate LLM streaming
export function streamMockAnalysis(prompt: string): ReadableStream<Uint8Array> {
  const mockResult: AnalysisResult = {
    strengths: [
      'Clear problem-solution fit identified',
      'Scalable SaaS model with recurring revenue',
      'First-mover advantage in niche market',
      'Low customer acquisition cost potential',
    ],
    weaknesses: [
      'Limited initial brand awareness',
      'Requires technical team to scale',
      'High onboarding friction for non-technical users',
    ],
    opportunities: [
      'Growing demand for AI-powered productivity tools',
      'Untapped SMB market segment',
      'Partnership opportunities with enterprise tools',
      'International expansion potential',
    ],
    threats: [
      'Established players could replicate features',
      'Economic downturn reducing SaaS budgets',
      'Regulatory changes in target markets',
    ],
    riskScore: 42,
    marketViability: 'HIGH',
    revenueEstimate: '$180K–$2.4M ARR (12–24 months)',
    competitorSummary:
      'Main competitors include Miro (visual collaboration), Notion AI (knowledge management), and Atlassian Confluence. Differentiation through real-time AI analysis and investor-ready pitch generation is a key moat.',
  }

  // Serialize as JSON chunks with a small delay to simulate streaming
  const jsonChunks = JSON.stringify(mockResult)
    .match(/.{1,50}/g) ?? [JSON.stringify(mockResult)]

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      for (const chunk of jsonChunks) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise((r) => setTimeout(r, 30))
      }
      controller.close()
    },
  })
}

// Real OpenAI streaming (activated when OPENAI_API_KEY is present)
export async function streamAIAnalysis(prompt: string): Promise<ReadableStream<Uint8Array>> {
  if (!process.env.OPENAI_API_KEY) {
    return streamMockAnalysis(prompt)
  }

  // Dynamic import to avoid bundling issues when key is absent
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: false, // We collect full response then stream to client
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a startup analyst. Respond ONLY with a JSON object matching this exact structure: { strengths: string[], weaknesses: string[], opportunities: string[], threats: string[], riskScore: number (0-100), marketViability: "LOW"|"MEDIUM"|"HIGH", revenueEstimate: string, competitorSummary: string }',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    console.error('OpenAI error, falling back to mock:', response.statusText)
    return streamMockAnalysis(prompt)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? '{}'

  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(content))
      controller.close()
    },
  })
}
