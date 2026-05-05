import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const questions = [
  {
    category: "Meta Principles",
    orderInCurriculum: 1,
    promptEn:
      'Think of a recent experience that made you feel "this is wonderful." What was it? Why did you find it wonderful?',
    promptJa:
      "あなたが「素敵だな」と感動した、最近の体験を一つ思い出してください。それは何でしたか？なぜ素敵だと感じましたか?",
    explanationDirection:
      "Confirm the staff member's ability to start from their own senses. Practice articulating 'wonder.' Show this is the first step to being a curator. Ask a deeper question about why they found it wonderful.",
    relatedPrinciples: "Meta Principle 1, Principle 9",
  },
  {
    category: "Meta Principles",
    orderInCurriculum: 2,
    promptEn:
      "The KINNOBUTA Group has a philosophy of not comparing itself to rival or competing stores. Why do you think we do this?",
    promptJa:
      "KINNOBUTAグループは、ライバル店や競合と比べないという哲学を持っています。あなたなら、なぜそうするのだと思いますか?",
    explanationDirection:
      "Let the staff guess first. Then present Meta Principle 2: 'We don't bring others onto our turf' and 'We only look at yesterday's version of ourselves.' Acknowledge their guess with respect before sharing the KINNOBUTA standard.",
    relatedPrinciples: "Meta Principle 2, Principle 1, Principle 3",
  },
  {
    category: "Define and Refine",
    orderInCurriculum: 3,
    promptEn:
      "What is a service or product you have wanted to experience again and again? Who do you think is the one continuously refining it?",
    promptJa:
      "あなたが、今までで一番繰り返し体験したいと思ったサービスや商品は何ですか？それを「磨き続けている」のは誰だと思いますか?",
    explanationDirection:
      "Introduce the abstract concept of 'refining' through something the staff already knows. Connect to Michael's process of input-output repetition described in Principle 1, Detail 3.",
    relatedPrinciples: "Principle 1 (Detail 3), Principle 6, Principle 9",
  },
  {
    category: "KINNOBUTA Standard",
    orderInCurriculum: 4,
    promptEn:
      "At KINNOBUTA, when guests are still in the store, we don't turn off the sign even after closing time. Why do you think we do this? If you were the manager, would you make the same decision?",
    promptJa:
      "KINNOBUTAでは、お客さんがいる間は閉店時間を過ぎても看板を消しません。なぜだと思いますか？あなたが店長だったら、同じ判断をしますか?",
    explanationDirection:
      "Use this small example of KINNOBUTA standard to help staff feel the 'guest experience over efficiency' judgment axis. The 'if you were manager' question creates ownership. If the staff says they'd turn off the sign, don't dismiss it — present the KINNOBUTA reasoning.",
    relatedPrinciples: "Principle 3, Principle 2",
  },
  {
    category: "Just Execute",
    orderInCurriculum: 5,
    promptEn:
      'Have you ever thought, "Do I really have to do this?" while working? In that moment, how did you decide?',
    promptJa:
      "仕事をしていて「これ、本当にやらないといけないのかな」と思った経験はありますか？そのとき、どう判断しましたか?",
    explanationDirection:
      "Draw out the 'but' as an excuse from the staff's own experience, which is the core of Principle 4. Don't lecture — receive the staff's experience first, then present the KINNOBUTA execution principle: 'Sure, but we still do it.'",
    relatedPrinciples: "Principle 4, Principle 5",
  },
  {
    category: "Doing vs Done",
    orderInCurriculum: 6,
    promptEn:
      "Is there something you want to try but haven't taken the first step on, because you're afraid of failure? What is it?",
    promptJa:
      "やってみたいけれど、失敗が怖くて踏み出せていないことはありますか？それは何ですか?",
    explanationDirection:
      "Entry point for Principle 7 'Doing vs Done.' Draw out the staff's personal stagnation point. The AI shouldn't push — let them become aware themselves. The 'tiger's den' reference can be used here.",
    relatedPrinciples: "Principle 7",
  },
  {
    category: "We Are Curators",
    orderInCurriculum: 7,
    promptEn:
      "Do you think dishwashing or working the register is a boring chore? Or is there some other meaning to it? Tell us your honest thoughts.",
    promptJa:
      "皿洗いやレジの仕事は、退屈な雑務だと思いますか？それとも、何か別の意味があると思いますか？あなたの考えを教えてください。",
    explanationDirection:
      "Let staff guess, then present 'dishwashing is a place where things happen.' Works especially well for staff who think it's boring. Don't dismiss their view — receive it, then show KINNOBUTA's perspective.",
    relatedPrinciples: "Principle 9 (All Curators section)",
  },
  {
    category: "We Are Curators",
    orderInCurriculum: 8,
    promptEn:
      "KINNOBUTA Group staff are called \"curators.\" How do you feel about this? \"I don't relate to this\" or \"It doesn't click\" are also valid answers. Be honest.",
    promptJa:
      "KINNOBUTAグループのスタッフは「キュレーター」だと言われます。これを聞いて、あなたはどう感じますか？「自分には関係ない」「ピンとこない」もOKです。正直に。",
    explanationDirection:
      "Direct hit of the core of Principle 9. Accept even if the staff shows resistance. Explain the motivation behind 'why curators' (wanting to share what you genuinely find wonderful). If possible, connect to what they said in Q1.",
    relatedPrinciples: "Principle 9 (Why Curators section), Meta Principle 1",
  },
  {
    category: "Move by Necessity, Think for Yourself",
    orderInCurriculum: 9,
    promptEn:
      "When the instructions from your supervisor or senior conflict with your own thinking, what do you do?",
    promptJa:
      "上司や先輩の指示と、自分の考えがズレたとき、あなたはどうしますか?",
    explanationDirection:
      "The hard part of Principle 5. Don't make it a binary of 'follow instructions' vs 'trust yourself.' Present all three: 'evaluated by results,' 'acknowledge your own errors,' 'don't stop thinking.' Show the KINNOBUTA middle ground — neither rebellious nor blindly obedient.",
    relatedPrinciples: "Principle 5, Principle 8",
  },
  {
    category: "Stay Open to Being Wrong",
    orderInCurriculum: 10,
    promptEn:
      "Have you ever been certain about something and later found out you were wrong? What did you learn from that experience?",
    promptJa:
      "あなたが「絶対にこうだ」と確信していたことが、後で間違っていたと分かった経験はありますか？そのとき、何を学びましたか?",
    explanationDirection:
      "Entry point for Principle 8. Let staff experience for themselves that 'certainty becomes overconfidence.' As the final question, use this as a meta-perspective on the 9 principles touched so far — 'your own thinking might also be wrong.'",
    relatedPrinciples: "Principle 8, Principle 5",
  },
]

async function main() {
  console.log("Seeding questions...")

  for (const q of questions) {
    await prisma.question.upsert({
      where: { orderInCurriculum: q.orderInCurriculum },
      update: q,
      create: q,
    })
  }

  console.log(`Seeded ${questions.length} questions.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
