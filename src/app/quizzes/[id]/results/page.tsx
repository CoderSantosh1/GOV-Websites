"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Trophy, Target, Clock, CheckCircle2, XCircle, ArrowLeft, Brain, Hexagon, LogOut, UserIcon } from "lucide-react"
import Link from "next/link"

interface User {
  _id: string
  name: string
  mobile: string
}

interface Question {
  _id: string
  text: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  _id: string
  title: string
  description: string
  timeLimit: number
  questions: Question[]
  totalMarks?: number
}

interface QuizAttempt {
  _id: string
  quizId: string
  userId: string
  answers: number[]
  score: number
  completedAt: string
}

export default function QuizResults({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/quizzes"
  }

  const handleStart = () => {
    router.push(`/quizzes/${params.id}`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }

    const fetchData = async () => {
      try {
        const attemptId = searchParams?.get("attemptId")
        if (!attemptId) {
          toast.error("No attempt ID provided")
          return
        }

        const [quizRes, attemptRes] = await Promise.all([
          fetch(`/api/quizzes/${params.id}`),
          fetch(`/api/quiz-attempts/${attemptId}`),
        ])

        if (!quizRes.ok || !attemptRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [quizData, attemptData] = await Promise.all([quizRes.json(), attemptRes.json()])

        setQuiz(quizData)
        setAttempt(attemptData)
      } catch (error) {
        console.error("Error fetching quiz results:", error)
        toast.error("Failed to load quiz results")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, searchParams])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="relative">
          {/* Multi-layered loading spinner - Mobile Optimized */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-4 border-cyan-400/30 rounded-full animate-spin">
            <div
              className="absolute inset-2 border-4 border-magenta-400/50 rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            >
              <div className="absolute inset-2 border-4 border-lime-400/70 rounded-full animate-spin">
                <div className="absolute inset-2 bg-gradient-to-br from-cyan-400 to-magenta-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
          <p className="text-cyan-400 font-bold text-sm sm:text-base md:text-lg mt-4 sm:mt-6 md:mt-8 text-center animate-pulse px-4">
            Processing Results...
          </p>
        </div>
      </div>
    )
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
        <Card
          className="border-0 bg-black/80 backdrop-blur-sm shadow-2xl p-4 sm:p-6 md:p-8 text-center w-full max-w-md"
          style={{
            clipPath: "polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 5% 100%, 0% 95%)",
            background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,10,46,0.9) 50%, rgba(0,0,0,0.9) 100%)",
          }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Results Not Found
          </h1>
          <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
            Unable to load your test results. Please try again.
          </p>
          <Button
            onClick={() => (window.location.href = "/quizzes")}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm md:text-base w-full sm:w-auto"
          >
            Return to Test Series
          </Button>
        </Card>
      </div>
    )
  }

  const calculateScore = () => {
    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (Number(question.correctAnswer) === Number(attempt.answers[index])) {
        correctAnswers++
      }
    })
    return (correctAnswers / quiz.questions.length) * 100
  }

  const score = calculateScore()
  const correctAnswers = quiz.questions.filter((q, i) => Number(q.correctAnswer) === Number(attempt.answers[i])).length

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-lime-400 to-emerald-500"
    if (score >= 60) return "from-yellow-400 to-orange-500"
    return "from-red-400 to-pink-500"
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return "EXCELLENT"
    if (score >= 80) return "VERY GOOD"
    if (score >= 70) return "GOOD"
    if (score >= 50) return "AVERAGE"
    return "NEEDS IMPROVEMENT"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Floating particles background - Reduced for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(isMobile ? 8 : 20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
              boxShadow: "0 0 4px currentColor",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto py-2 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-4 md:px-6 relative z-10 max-w-7xl">
        {/* User Profile Section - Enhanced Mobile Layout */}
        {user && (
          <Card className="mb-4 sm:mb-6 border-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm shadow-xl">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col gap-4">
                {/* Top row - User info and logout */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-cyan-400 truncate">
                        {user.name}
                      </p>
                      
                    </div>
                  </div>

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white transition-colors duration-300 text-xs sm:text-sm flex-shrink-0"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Logout
                  </Button>
                </div>

                {/* Bottom row - Score display */}
                <div className="flex justify-center">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-cyan-400/10 to-magenta-400/10 rounded-lg border border-cyan-400/20">
                    <div className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      {getScoreGrade(score)}
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{score.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Results Container - Enhanced Mobile */}
        <div
          className="relative overflow-hidden border-0 bg-black/80 backdrop-blur-sm shadow-2xl mb-4 sm:mb-8"
          style={{
            clipPath: "polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 5% 100%, 0% 95%)",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,10,46,0.9) 25%, rgba(22,33,62,0.9) 50%, rgba(15,52,96,0.9) 75%, rgba(0,0,0,0.9) 100%)",
          }}
        >
          {/* Animated border */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 opacity-50 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-lime-400 via-cyan-400 to-magenta-400 opacity-50 animate-pulse" />

          <CardHeader className="border-b border-cyan-400/30 bg-gradient-to-r from-black/50 to-purple-900/30 backdrop-blur-sm p-3 sm:p-4 md:p-6">
            <div className="text-center">
              <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent animate-pulse">
                  Test Results
                </span>
              </CardTitle>
              <p className="text-cyan-300 text-xs sm:text-sm md:text-base lg:text-lg font-semibold">{quiz.title}</p>
              <p className="text-cyan-400/80 text-xs sm:text-sm md:text-base mt-1">{quiz.description}</p>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Score Display - Enhanced Mobile Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              {/* Main Score - Mobile First */}
              <div className="lg:col-span-2 relative">
                <div
                  className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm border border-cyan-400/30 text-center"
                  style={{ clipPath: "polygon(0% 0%, 90% 0%, 100% 25%, 100% 100%, 10% 100%, 0% 75%)" }}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-400 to-magenta-500 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div
                        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}
                      >
                        {score.toFixed(1)}%
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-wider">
                        {getScoreGrade(score)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-black text-lime-400">{correctAnswers}</div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-lime-300 uppercase tracking-wider">
                        Correct
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-black text-red-400">
                        {quiz.questions.length - correctAnswers}
                      </div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-red-300 uppercase tracking-wider">
                        Incorrect
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-cyan-400/10 blur-xl opacity-50 animate-pulse -z-10" />
              </div>

              {/* Stats Sidebar - Mobile Grid */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 md:gap-4 lg:space-y-2">
                {/* Total Questions */}
                <div className="relative group">
                  <div
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-magenta-500/20 to-purple-500/20 backdrop-blur-sm border border-magenta-400/30 transform group-hover:scale-105 transition-transform duration-300"
                    style={{ clipPath: "polygon(10% 0%, 100% 0%, 100% 75%, 90% 100%, 0% 100%, 0% 25%)" }}
                  >
                    <div className="flex flex-col lg:flex-row items-center gap-1 sm:gap-2 md:gap-3">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-magenta-400 animate-pulse" />
                      <div className="text-center lg:text-left">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black text-magenta-400">
                          {quiz.questions.length}
                        </div>
                        <div className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-magenta-300 uppercase tracking-wider">
                          Questions
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-magenta-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>

                {/* Time Limit */}
                <div className="relative group">
                  <div
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 transform group-hover:scale-105 transition-transform duration-300"
                    style={{ clipPath: "polygon(0% 0%, 90% 0%, 100% 25%, 100% 100%, 10% 100%, 0% 75%)" }}
                  >
                    <div className="flex flex-col lg:flex-row items-center gap-1 sm:gap-2 md:gap-3">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-yellow-400 animate-pulse" />
                      <div className="text-center lg:text-left">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black text-yellow-400">
                          {quiz.timeLimit}
                        </div>
                        <div className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-yellow-300 uppercase tracking-wider">
                          Minutes
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>

                {/* Completion Date */}
                <div className="relative group">
                  <div
                    className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 transform group-hover:scale-105 transition-transform duration-300"
                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
                  >
                    <div className="flex flex-col lg:flex-row items-center gap-1 sm:gap-2 md:gap-3">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-cyan-400 animate-pulse" />
                      <div className="text-center lg:text-left">
                        <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black text-cyan-400">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </div>
                        <div className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-cyan-300 uppercase tracking-wider">
                          Completed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>
              </div>
            </div>

            {/* Questions Review - Enhanced Mobile */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-center mb-4 sm:mb-6 md:mb-8 flex items-center justify-center gap-2 sm:gap-3">
                <span className="bg-gradient-to-r text-[#a3e635] text-transparent">
                   Test Series Analysis
                </span>
              </h2>
              {quiz.questions.map((question, index) => {
                const userAnswer = Number(attempt.answers[index])
                const isCorrect = Number(question.correctAnswer) === userAnswer
                const wasAnswered = userAnswer !== -1

                return (
                  <Card
                    key={question._id}
                    className="border-0 bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm shadow-xl"
                  >
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Question Header - Enhanced Mobile */}
                        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center font-black text-white text-xs sm:text-sm md:text-base flex-shrink-0 ${
                              isCorrect
                                ? "bg-gradient-to-br from-lime-400 to-emerald-500"
                                : wasAnswered
                                  ? "bg-gradient-to-br from-red-400 to-pink-500"
                                  : "bg-gradient-to-br from-gray-400 to-gray-600"
                            }`}
                            style={{
                              clipPath:
                                index % 2 === 0
                                  ? "polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)"
                                  : "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%)",
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed break-words">
                              {question.text}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              {isCorrect ? (
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-lime-400 flex-shrink-0" />
                              ) : wasAnswered ? (
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" />
                              ) : (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-gray-400 flex-shrink-0" />
                              )}
                              <span
                                className={`text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider ${
                                  isCorrect ? "text-lime-400" : wasAnswered ? "text-red-400" : "text-gray-400"
                                }`}
                              >
                                {isCorrect ? "Correct" : wasAnswered ? "Incorrect" : "Not Answered"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Answer Options - Enhanced Mobile */}
                        <div className="space-y-2 sm:space-y-3 ml-6 sm:ml-8 md:ml-10 lg:ml-16">
                          {question.options.map((option, optionIndex) => {
                            const isUserAnswer = optionIndex === userAnswer
                            const isCorrectAnswer = optionIndex === Number(question.correctAnswer)

                            return (
                              <div
                                key={optionIndex}
                                className={`p-2 sm:p-3 md:p-4 rounded-lg border transition-all duration-300 ${
                                  isCorrectAnswer
                                    ? "border-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/20"
                                    : isUserAnswer && !isCorrectAnswer
                                      ? "border-red-400 bg-red-400/10 shadow-lg shadow-red-400/20"
                                      : "border-gray-600/50 bg-black/20"
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div
                                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold flex-shrink-0 ${
                                      isCorrectAnswer
                                        ? "bg-lime-400 text-black"
                                        : isUserAnswer && !isCorrectAnswer
                                          ? "bg-red-400 text-white"
                                          : "bg-gray-600 text-gray-300"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optionIndex)}
                                  </div>
                                  <span
                                    className={`text-xs sm:text-sm md:text-base font-medium flex-1 break-words leading-relaxed ${
                                      isCorrectAnswer
                                        ? "text-lime-300"
                                        : isUserAnswer && !isCorrectAnswer
                                          ? "text-red-300"
                                          : "text-gray-300"
                                    }`}
                                  >
                                    {option}
                                  </span>
                                  {isCorrectAnswer && (
                                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-lime-400 flex-shrink-0" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Action Button - Enhanced Mobile */}
            <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12">
              <Link href={`/quizzes/${params.id}/instructions`} className="block">
                <Button
                  className="relative bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 hover:from-cyan-500 hover:via-magenta-500 hover:to-lime-500 text-black font-black px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30 overflow-hidden w-full sm:w-auto max-w-sm touch-manipulation"
                  style={{
                    clipPath: "polygon(0% 0%, 90% 0%, 100% 30%, 100% 100%, 10% 100%, 0% 70%)",
                  }}
                >
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 via-cyan-400/20 to-magenta-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                  <span className="relative flex items-center justify-center gap-2 sm:gap-3 z-10">
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    Return to Test Series
                    <Hexagon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 animate-spin" />
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Add Go to Profile button at the bottom */}
      <div className="flex justify-center mt-8">
        <Link href="/profile">
          <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-6 py-3 text-lg">
            Go to Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}
