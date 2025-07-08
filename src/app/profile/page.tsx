"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  User,
  Trophy,
  Target,
  Clock,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  BarChart3,
  Zap,
  Brain,
  Star,
  ArrowRight,
  LogOut,
  RefreshCw,
} from "lucide-react"

interface Quiz {
  _id: string
  title: string
  description?: string
  totalMarks: number
  timeLimit: number
  questions: Array<{
    _id: string
    text: string
    options: string[]
    correctAnswer: number
  }>
}

interface QuizAttempt {
  _id: string
  quizId: Quiz | string
  userId: string
  score: number
  answers: number[]
  completedAt: string
  timeSpent?: number
}

interface UserProfile {
  _id: string
  name: string
  mobile?: string
  email?: string
  joinedAt?: string
  totalAttempts?: number
  averageScore?: number
  bestScore?: number
  rank?: number
  profileImage?: string
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Fetch user from localStorage (or replace with your auth context/API)
  const fetchUser = async () => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser({
          ...parsedUser,
          joinedAt: parsedUser.joinedAt || new Date().toISOString(),
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          rank: 0,
        })
      } else {
        toast.error("Please log in to view your profile")
        return
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Failed to load user profile")
    }
  }

  // Fetch all quizzes and user's attempts
  const fetchData = async (userId: string) => {
    setLoading(true)
    try {
      // Fetch all quizzes
      const quizRes = await fetch("/api/quizzes")
      const quizJson = await quizRes.json()
      const allQuizzes = quizJson.data || []
      setQuizzes(allQuizzes)

      // Fetch user's attempts
      const attemptRes = await fetch(`/api/quiz-attempts?userId=${userId}`)
      if (attemptRes.ok) {
        const attemptJson = await attemptRes.json()
        const userAttempts = Array.isArray(attemptJson) ? attemptJson : attemptJson.data || []
        setAttempts(userAttempts)

        // Calculate enhanced user stats
        if (userAttempts.length > 0) {
          const totalScore = userAttempts.reduce((sum: number, attempt: QuizAttempt) => sum + attempt.score, 0)
          const averageScore = totalScore / userAttempts.length
          const bestScore = Math.max(...userAttempts.map((attempt: QuizAttempt) => attempt.score))

          setUser((prev) => ({
            ...prev!,
            totalAttempts: userAttempts.length,
            averageScore: Math.round(averageScore * 100) / 100,
            bestScore,
            rank: Math.floor(Math.random() * 100) + 1, // Mock rank calculation
          }))
        }
      } else {
        setAttempts([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user && user._id) {
      fetchData(user._id)
    }
  }, [user?._id])

  useEffect(() => {
    if (user && user.profileImage) {
      setProfileImage(user.profileImage)
    } else {
      const stored = localStorage.getItem('profileImage')
      if (stored) setProfileImage(stored)
    }
  }, [user])

  const handleRefresh = async () => {
    setRefreshing(true)
    if (user && user._id) {
      await fetchData(user._id)
    }
    setRefreshing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    toast.success("Logged out successfully")
    window.location.href = "/quizzes"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-lime-400 to-emerald-500"
    if (score >= 60) return "from-yellow-400 to-orange-500"
    return "from-red-400 to-pink-500"
  }

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", label: "EXCELLENT" }
    if (score >= 80) return { grade: "A", label: "VERY GOOD" }
    if (score >= 70) return { grade: "B", label: "GOOD" }
    if (score >= 60) return { grade: "C", label: "AVERAGE" }
    return { grade: "D", label: "NEEDS IMPROVEMENT" }
  }

  // Handle avatar click/upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user._id)
    try {
      const res = await fetch('/api/profile-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.imageUrl) {
        setProfileImage(data.imageUrl)
        localStorage.setItem('profileImage', data.imageUrl)
        setUser((prev) => prev ? { ...prev, profileImage: data.imageUrl } : prev)
        toast.success('Profile image updated!')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (err) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <Card
          className="border-0 bg-black/80 backdrop-blur-sm shadow-2xl p-8 text-center max-w-md"
          style={{
            clipPath: "polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 5% 100%, 0% 95%)",
            background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,10,46,0.9) 50%, rgba(0,0,0,0.9) 100%)",
          }}
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center">
            <User className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Access Denied
          </h1>
          <p className="text-gray-300 mb-6">Please log in to access your neural profile</p>
          <Button
            onClick={() => (window.location.href = "/quizzes")}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-8 py-3"
          >
            Return to Hub
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      <div className="container mx-auto py-8 px-4 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* <Button
              onClick={() => (window.location.href = "/quizzes")}
              className="border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400/10 font-bold px-6 py-3"
            >
              ← BACk To Results Page
            </Button> */}

            
          </div>

          <div className="flex items-center gap-3">
            {/* <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-2 border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-400/10 font-bold px-4 py-3"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh profile
            </Button> */}
            <Button
              onClick={handleLogout}
              className="border-2 border-red-400 text-red-400 bg-transparent hover:bg-red-400/10 font-bold px-4 py-3"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Profile Container */}
        <div
          className="relative overflow-hidden border-0 bg-black/80 backdrop-blur-sm shadow-2xl mb-8" >
          

          {/* Profile Header */}
          <CardHeader className="border-b border-cyan-400/30 bg-gradient-to-r from-black/50 to-purple-900/30 backdrop-blur-sm p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative z-20">
                  <input
                    ref={fileInputRef}
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <div
                    className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-magenta-500 rounded-lg flex items-center justify-center shadow-2xl cursor-pointer overflow-hidden z-20"
                    onClick={handleAvatarClick}
                    title="Click to change profile image"
                    style={{ position: 'relative' }}
                    tabIndex={0}
                    role="button"
                    aria-label="Change profile image"
                    onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleAvatarClick() }}
                  >
                    {uploading ? (
                      <div className="w-10 h-10 flex items-center justify-center animate-spin">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      </div>
                    ) : profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-cyan-400/20 blur-xl animate-pulse rounded-lg z-10 pointer-events-none" />
                </div>

                {/* User Info */}
                <div>
                  <CardTitle className="text-3xl font-black mb-2">
                    <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent animate-pulse">
                      {user.name}
                    </span>
                  </CardTitle>
                  <div className="space-y-1">
                    {user.mobile && (
                      <p className="text-cyan-300 font-semibold flex items-center gap-2">📱 {user.mobile}</p>
                    )}
                    {user.email && (
                      <p className="text-cyan-300 font-semibold flex items-center gap-2">📧 {user.email}</p>
                    )}
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      DATE: {new Date(user.joinedAt || "").toLocaleDateString()}
                    </p>
                  </div>   
                </div>
               
              </div>
               {/* Timer used */}
               <div className="flex items-center justify-between gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full animate-pulse">
                  <div className="absolute inset-1 border border-magenta-400/30 rounded-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs font-black text-cyan-400 leading-none">
                          {new Date().toLocaleTimeString("en-US", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[8px] font-bold text-cyan-300 uppercase tracking-wider">TIME</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-cyan-400 rounded-full" />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-magenta-400 rounded-full" />
                </div>
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md animate-pulse" />
              </div>
            </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 rounded-lg border border-lime-400/30">
                  <div className="text-2xl font-black text-lime-400">{user.totalAttempts || 0}</div>
                  <div className="text-xs font-bold text-lime-300 uppercase tracking-wider">Tests</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/30">
                  <div className="text-2xl font-black text-yellow-400">#{user.rank || "N/A"}</div>
                  <div className="text-xs font-bold text-yellow-300 uppercase tracking-wider">Rank</div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-cyan-400/30 rounded-full animate-spin">
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
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Average Score */}
                  <div className="relative group">
                    <div
                      className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 transform group-hover:scale-105 transition-transform duration-300"
                      style={{ clipPath: "polygon(0% 0%, 90% 0%, 100% 25%, 100% 100%, 10% 100%, 0% 75%)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-cyan-400">
                            {user.averageScore?.toFixed(1) || "0.0"}%
                          </div>
                          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Average Score</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </div>

                  {/* Best Score */}
                  <div className="relative group">
                    <div
                      className="p-6 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 backdrop-blur-sm border border-lime-400/30 transform group-hover:scale-105 transition-transform duration-300"
                      style={{ clipPath: "polygon(10% 0%, 100% 0%, 100% 75%, 90% 100%, 0% 100%, 0% 25%)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-lime-400">{user.bestScore || 0}%</div>
                          <div className="text-xs font-bold text-lime-300 uppercase tracking-wider">Best Score</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-lime-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </div>

                  {/* Performance Grade */}
                  <div className="relative group">
                    <div
                      className="p-6 bg-gradient-to-br from-magenta-500/20 to-purple-500/20 backdrop-blur-sm border border-magenta-400/30 transform group-hover:scale-105 transition-transform duration-300"
                      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-magenta-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-magenta-400">
                            {getPerformanceGrade(user.averageScore || 0).grade}
                          </div>
                          <div className="text-xs font-bold text-magenta-300 uppercase tracking-wider">
                            {getPerformanceGrade(user.averageScore || 0).label}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-magenta-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </div>
                </div>

                {/* Test Results Section */}
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <h2 className="text-2xl font-black text-center flex items-center justify-center gap-3">
                      <Brain className="w-8 h-8 text-magenta-400 animate-pulse" />
                      <span className="bg-gradient-to-r from-magenta-400 to-purple-400 bg-clip-text text-transparent">
                        All Test Results
                      </span>
                    </h2>
                    <Button
                      className="mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-6 py-2"
                      onClick={() => setShowHistory((prev) => !prev)}
                    >
                      {showHistory ? "Hide Test History" : "Show Test History"}
                    </Button>
                  </div>

                  {showHistory && (
                    attempts.length === 0 ? (
                      <Card className="border-0 bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                            <Target className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-400 mb-2">No Test Results Found</h3>
                          <p className="text-gray-500 mb-6">Start taking tests to see your results here</p>
                          <Link href="/quizzes">
                            <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-8 py-3">
                              <Zap className="w-4 h-4 mr-2" />
                              Start Testing
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {attempts.map((attempt, index) => {
                          const quiz = typeof attempt.quizId === "object" ? attempt.quizId : null
                          const quizTitle = quiz?.title || `Quiz ${attempt.quizId}`
                          const score = attempt.score
                          const isRecent = index < 3

                          return (
                            <Card
                              key={attempt._id}
                              className="border-0 bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm shadow-xl"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-white ${
                                        score >= 80
                                          ? "bg-gradient-to-br from-lime-400 to-emerald-500"
                                          : score >= 60
                                            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                                            : "bg-gradient-to-br from-red-400 to-pink-500"
                                      }`}
                                      style={{
                                        clipPath:
                                          index % 2 === 0
                                            ? "polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)"
                                            : "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%)",
                                      }}
                                    >
                                      {score}%
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-white text-lg">{quizTitle}</h3>
                                      <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(attempt.completedAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {new Date(attempt.completedAt).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {isRecent && (
                                      <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold">
                                        Recent
                                      </Badge>
                                    )}
                                    <Badge className={`font-bold text-black bg-gradient-to-r ${getScoreColor(score)}`}>
                                      {getPerformanceGrade(score).grade}
                                    </Badge>
                                    {score >= 80 ? (
                                      <CheckCircle2 className="w-6 h-6 text-lime-400" />
                                    ) : (
                                      <XCircle className="w-6 h-6 text-red-400" />
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )
                  )}
                </div>

                {/* Available Tests Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-3">
                    <BookOpen className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Available Neural Tests
                    </span>
                  </h2>

                  {quizzes.length === 0 ? (
                    <Card className="border-0 bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-sm shadow-xl">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No Tests Available</h3>
                        <p className="text-gray-500">Check back later for new tests</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizzes.slice(0, 6).map((quiz, index) => {
                        const userAttempt = attempts.find(
                          (attempt) =>
                            (typeof attempt.quizId === "object" ? attempt.quizId._id : attempt.quizId) === quiz._id,
                        )
                        const hasAttempted = !!userAttempt

                        return (
                          <Card
                            key={quiz._id}
                            className="border-0 bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm shadow-xl hover:scale-105 transition-transform duration-300 group"
                          >
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div
                                    className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-magenta-500 rounded-lg flex items-center justify-center"
                                    style={{
                                      clipPath:
                                        index % 3 === 0
                                          ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                                          : index % 3 === 1
                                            ? "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%)"
                                            : "polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)",
                                    }}
                                  >
                                    <Brain className="w-5 h-5 text-white" />
                                  </div>
                                  {hasAttempted && (
                                    <Badge className="bg-gradient-to-r from-lime-400 to-emerald-500 text-black font-bold">
                                      Completed
                                    </Badge>
                                  )}
                                </div>

                                <div>
                                  <h3 className="font-bold text-white text-lg line-clamp-2">{quiz.title}</h3>
                                  {quiz.description && (
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{quiz.description}</p>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div className="p-2 bg-cyan-500/20 rounded border border-cyan-400/30">
                                    <div className="text-sm font-bold text-cyan-400">{quiz.questions?.length || 0}</div>
                                    <div className="text-xs text-cyan-300">Questions</div>
                                  </div>
                                  <div className="p-2 bg-yellow-500/20 rounded border border-yellow-400/30">
                                    <div className="text-sm font-bold text-yellow-400">{quiz.totalMarks || 0}</div>
                                    <div className="text-xs text-yellow-300">Marks</div>
                                  </div>
                                  <div className="p-2 bg-purple-500/20 rounded border border-purple-400/30">
                                    <div className="text-sm font-bold text-purple-400">{quiz.timeLimit || 0}</div>
                                    <div className="text-xs text-purple-300">Minutes</div>
                                  </div>
                                </div>

                                <Link href={`/quizzes/${quiz._id}`} className="block">
                                  <Button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold py-3 group-hover:shadow-lg group-hover:shadow-cyan-400/30 transition-all duration-300">
                                    {hasAttempted ? "Retake Test" : "Start Test"}
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {quizzes.length > 6 && (
                    <div className="text-center">
                      <Link href="/quizzes">
                        <Button className="bg-gradient-to-r from-magenta-400 to-purple-500 hover:from-magenta-500 hover:to-purple-600 text-white font-bold px-8 py-3">
                          View All Tests
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
