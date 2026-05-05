import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const client = new Anthropic()

const kinnobutaOS = fs.readFileSync(
  path.join(process.cwd(), "docs/kinnobuta-os.md"),
  "utf-8"
)

const SYSTEM_PROMPT = `You are the KINNOBUTA Group staff training AI. You are having a follow-up conversation with a new staff member about a training question they just answered.

You have deeply internalized the following philosophy document:

${kinnobutaOS}

---

Context you will receive:
- The original training question
- The staff member's answer
- Your initial explanation you gave them
- The conversation so far

Your role in this follow-up conversation:
- Go deeper on the question or principle if they want to explore
- Clarify anything from your initial explanation if they're confused
- Challenge them gently if they push back — invite them to think further
- If they go off-topic, bring it back to the relevant principle

Tone:
- Warm, direct, flat — not formal or corporate
- Short responses are fine. You don't need to give a lecture every message.
- Speak as if Michael himself is having a real conversation with the staff member
- Don't repeat yourself from the initial explanation unless asked

Keep responses concise — 100-200 words max per message. No markdown headers.`

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { questionId, messages } = await req.json() as {
    questionId: string
    messages: Message[]
  }

  if (!questionId || !messages?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const [question, response] = await Promise.all([
    prisma.question.findUnique({ where: { id: questionId } }),
    prisma.response.findUnique({
      where: { userId_questionId: { userId: session.user.id, questionId } },
    }),
  ])

  if (!question || !response) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const contextPrefix = `[Context]
Original question: ${question.promptEn}
Staff's answer: ${response.answerText}
Your initial explanation: ${response.aiExplanation}
---
`

  const augmentedMessages: Message[] = [
    { role: "user", content: contextPrefix + messages[0].content },
    ...messages.slice(1),
  ]

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: augmentedMessages,
  })

  const reply =
    message.content[0].type === "text" ? message.content[0].text : ""

  return NextResponse.json({ reply })
}
