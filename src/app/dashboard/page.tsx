import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { signOut } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [questions, responses] = await Promise.all([
    prisma.question.findMany({ orderBy: { orderInCurriculum: "asc" } }),
    prisma.response.findMany({ where: { userId: session.user.id } }),
  ])

  const completedIds = new Set(responses.map((r) => r.questionId))
  const total = questions.length
  const completed = responses.length
  const nextQuestion = questions.find((q) => !completedIds.has(q.id))

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-stone-900 text-sm tracking-tight">
          KINNOBUTA Training
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">{session.user.name}</span>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button className="text-sm text-stone-400 hover:text-stone-600">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-stone-900">
            Your Progress
          </h1>
          <p className="text-stone-500 text-sm">
            {completed} of {total} questions completed
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-800 rounded-full transition-all"
            style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
          />
        </div>

        {/* Next question CTA */}
        {nextQuestion ? (
          <Link
            href={`/question/${nextQuestion.id}`}
            className="block w-full text-center px-6 py-4 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            {completed === 0
              ? "Start training"
              : `Continue — Question ${nextQuestion.orderInCurriculum}`}
          </Link>
        ) : (
          <div className="text-center py-6 space-y-2">
            <p className="text-lg font-medium text-stone-900">
              All questions completed.
            </p>
            <p className="text-sm text-stone-500">
              Your manager will follow up with next steps.
            </p>
          </div>
        )}

        {/* Question list */}
        <div className="space-y-2">
          {questions.map((q) => {
            const done = completedIds.has(q.id)
            return (
              <Link
                key={q.id}
                href={`/question/${q.id}`}
                className="flex items-center gap-4 px-4 py-3 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-colors"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    done
                      ? "bg-stone-800 text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {done ? "✓" : q.orderInCurriculum}
                </span>
                <span
                  className={`text-sm ${done ? "text-stone-400" : "text-stone-700"}`}
                >
                  {q.promptEn.length > 80
                    ? q.promptEn.slice(0, 80) + "…"
                    : q.promptEn}
                </span>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
