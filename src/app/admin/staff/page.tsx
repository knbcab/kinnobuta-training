import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminStaffPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Check admin role
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (currentUser?.role !== "ADMIN") redirect("/dashboard")

  const [staff, questions, responses] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        assignedBrand: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.question.findMany({ select: { id: true } }),
    prisma.response.findMany({
      select: { userId: true, questionId: true, createdAt: true },
    }),
  ])

  const totalQuestions = questions.length
  const responsesByUser = responses.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.userId] = (acc[r.userId] ?? 0) + 1
      return acc
    },
    {}
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-stone-900 text-sm tracking-tight">
          KINNOBUTA Training — Admin
        </span>
        <span className="text-sm text-stone-500">{session.user.name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">
              Staff Progress
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {staff.length} staff · {totalQuestions} questions
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs text-stone-400 uppercase tracking-widest">
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Brand</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Progress</th>
                <th className="text-left px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-stone-400"
                  >
                    No staff yet.
                  </td>
                </tr>
              )}
              {staff.map((s) => {
                const completed = responsesByUser[s.id] ?? 0
                const pct =
                  totalQuestions > 0
                    ? Math.round((completed / totalQuestions) * 100)
                    : 0
                return (
                  <tr
                    key={s.id}
                    className="border-b border-stone-50 hover:bg-stone-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-800">
                        {s.name ?? "—"}
                      </div>
                      <div className="text-xs text-stone-400">{s.email}</div>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {s.assignedBrand ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-700 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-stone-500 text-xs">
                          {completed}/{totalQuestions}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-400 text-xs">
                      {s.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IN_CURRICULUM: "bg-blue-50 text-blue-600",
    IN_EXAM: "bg-yellow-50 text-yellow-600",
    PASSED: "bg-green-50 text-green-600",
    REJECTED: "bg-red-50 text-red-600",
    DROPPED: "bg-stone-100 text-stone-400",
  }
  const labels: Record<string, string> = {
    IN_CURRICULUM: "In curriculum",
    IN_EXAM: "In exam",
    PASSED: "Passed",
    REJECTED: "Rejected",
    DROPPED: "Dropped",
  }
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-stone-100 text-stone-500"}`}
    >
      {labels[status] ?? status}
    </span>
  )
}
