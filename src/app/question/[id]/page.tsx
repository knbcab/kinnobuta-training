import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import QuestionClient from "./QuestionClient"

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuestionPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const question = await prisma.question.findUnique({ where: { id } })
  if (!question) notFound()

  const existingResponse = await prisma.response.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId: id } },
  })

  const allQuestions = await prisma.question.findMany({
    orderBy: { orderInCurriculum: "asc" },
    select: { id: true, orderInCurriculum: true },
  })
  const currentIndex = allQuestions.findIndex((q) => q.id === id)
  const nextQuestion = allQuestions[currentIndex + 1] ?? null
  const prevQuestion = allQuestions[currentIndex - 1] ?? null

  return (
    <QuestionClient
      question={{
        id: question.id,
        orderInCurriculum: question.orderInCurriculum,
        category: question.category,
        promptEn: question.promptEn,
      }}
      existingAnswer={existingResponse?.answerText ?? null}
      existingExplanation={existingResponse?.aiExplanation ?? null}
      nextQuestionId={nextQuestion?.id ?? null}
      prevQuestionId={prevQuestion?.id ?? null}
      totalQuestions={allQuestions.length}
    />
  )
}
