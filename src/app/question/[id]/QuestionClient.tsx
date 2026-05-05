"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface Props {
  question: {
    id: string
    orderInCurriculum: number
    category: string
    promptEn: string
  }
  existingAnswer: string | null
  existingExplanation: string | null
  nextQuestionId: string | null
  prevQuestionId: string | null
  totalQuestions: number
}

export default function QuestionClient({
  question,
  existingAnswer,
  existingExplanation,
  nextQuestionId,
  prevQuestionId,
  totalQuestions,
}: Props) {
  const startTime = useRef<number>(0)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startTime.current = Date.now()
  }, [])

  const [answer, setAnswer] = useState(existingAnswer ?? "")
  const [explanation, setExplanation] = useState(existingExplanation ?? "")
  const [submitted, setSubmitted] = useState(!!existingAnswer)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  async function handleSubmit() {
    if (!answer.trim()) return
    setLoading(true)
    setError("")

    const timeSpent = Math.round((Date.now() - startTime.current) / 1000)

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim(),
          timeSpentSeconds: timeSpent,
        }),
      })

      if (!res.ok) throw new Error("Failed to get explanation")

      const data = await res.json()
      setExplanation(data.explanation)
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleChatSend() {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: msg },
    ]
    setChatMessages(newMessages)
    setChatInput("")
    setChatLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          messages: newMessages,
        }),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ])
    } catch {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Try again." },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Dashboard
        </Link>
        <span className="text-xs text-stone-400">
          {question.orderInCurriculum} / {totalQuestions}
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Question */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">
            {question.category}
          </span>
          <p className="text-xl text-stone-900 leading-relaxed font-medium">
            {question.promptEn}
          </p>
        </div>

        {/* Answer area */}
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted || loading}
            placeholder="Write your thoughts here..."
            rows={5}
            className="w-full px-4 py-3 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-stone-400 disabled:bg-stone-50 disabled:text-stone-500 placeholder-stone-300"
          />

          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
              className="px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Getting explanation…" : "Submit"}
            </button>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* AI Explanation + Chat */}
        {submitted && explanation && (
          <div className="space-y-6">
            <div className="w-full h-px bg-stone-200" />

            {/* Initial explanation */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                KINNOBUTA perspective
              </p>
              <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                {explanation}
              </div>
            </div>

            {/* Follow-up chat */}
            <div className="space-y-4">
              <div className="w-full h-px bg-stone-100" />

              {chatMessages.length > 0 && (
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-stone-800 text-white rounded-br-sm"
                            : "bg-white border border-stone-200 text-stone-700 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <span className="text-stone-400 text-sm">…</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* Chat input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleChatSend()
                    }
                  }}
                  placeholder="Ask a follow-up question…"
                  disabled={chatLoading}
                  className="flex-1 px-4 py-3 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 disabled:opacity-50 placeholder-stone-300"
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-4 py-3 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {prevQuestionId && (
                <Link
                  href={`/question/${prevQuestionId}`}
                  className="px-4 py-3 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
                >
                  ← Previous
                </Link>
              )}
              {nextQuestionId ? (
                <Link
                  href={`/question/${nextQuestionId}`}
                  className="flex-1 text-center px-4 py-3 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
                >
                  Next question →
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex-1 text-center px-4 py-3 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
                >
                  Back to dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
