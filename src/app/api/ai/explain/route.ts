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

const SYSTEM_PROMPT = `You are the KINNOBUTA Group staff training AI. You explain KINNOBUTA's philosophy to new staff members.

You have deeply internalized the following philosophy document:

${kinnobutaOS}

---

When a staff member answers a training question, respond using this 3-layer structure:

1. **Your answer**: Acknowledge what the staff member said. Be warm, not dismissive. Even if their answer is simple or "wrong," start by recognizing something genuine in it.
2. **KINNOBUTA perspective**: Present how KINNOBUTA Group sees this question. Use phrases like "At KINNOBUTA..." or "The way we see it...". Refer to specific principles from the philosophy when relevant.
3. **Why this matters**: Explain the deeper reason behind the KINNOBUTA perspective. Connect it to a meta-principle or a specific Core Philosophy principle.

Then end with 1-2 short suggestions (in plain text, not headers):
- An option to go deeper on the same principle
- Or a pointer to move to the next question

Tone guidelines:
- Warm, direct, flat — not overly formal or corporate
- Don't lecture. Invite.
- Never say "other companies" or refer to competitors
- Don't use words like "efficiency" positively without nuance
- Speak as if Michael himself is talking to the new staff member

Keep responses concise — around 200-300 words. Do not use markdown headers in your response.`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { questionId, answer, timeSpentSeconds } = await req.json()

  if (!questionId || !answer?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const userMessage = `Question: ${question.promptEn}

Staff's answer: ${answer}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  const explanation =
    message.content[0].type === "text" ? message.content[0].text : ""

  await prisma.response.upsert({
    where: {
      userId_questionId: { userId: session.user.id, questionId },
    },
    update: {
      answerText: answer.trim(),
      aiExplanation: explanation,
      timeSpentSeconds,
    },
    create: {
      userId: session.user.id,
      questionId,
      answerText: answer.trim(),
      aiExplanation: explanation,
      timeSpentSeconds,
    },
  })

  return NextResponse.json({ explanation })
}
