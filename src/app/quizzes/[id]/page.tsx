"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, type ButtonProps } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer'
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, CheckCircle2, Flag, ArrowRight, Zap, Star, Hexagon, Brain, ArrowLeft, User } from 'lucide-react';
import Link from "next/link"
import AuthModal from '@/components/AuthModal';
import ConfirmationModal from "../../../components/ui/ConfirmationModal"
import { title } from 'process';
import { LANG } from "./lang";

enum QuestionStatus {
  NotViewed = 'not-viewed',
  Viewed = 'viewed',
  Attempted = 'attempted',
  ToReview = 'to-review',
  AttemptedAndMarkedForReview = 'attempted-review',
}

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  totalMarks: number;
  questions: Question[];
}

const getStatusColor = (status: QuestionStatus): string => {
  switch (status) {
    case QuestionStatus.Attempted:
      return "from-lime-400 to-lime-600";
    case QuestionStatus.Viewed:
      return "from-red-400 to-red-600";
    case QuestionStatus.NotViewed:
      return "from-gray-500 to-gray-700";
    case QuestionStatus.ToReview:
      return "from-cyan-400 to-cyan-600";
    case QuestionStatus.AttemptedAndMarkedForReview:
      return "from-red-400 to-red-600";
    default:
      return "from-gray-500 to-gray-700";
  }
};

export default function TakeQuiz({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    type: "warning" as "warning" | "danger" | "success" | "info",
    unansweredCount: 0,
  });
  const [lang, setLang] = useState<'en' | 'hi' | null>(null);
  const t = lang ? LANG[lang] : LANG['en'];

  // Initialize user check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const quizStarted = localStorage.getItem(`quiz-started-${params.id}`);
      if (!quizStarted) {
        // First open: skip validations
        setIsInitializing(false);
        return;
      }
      // If quiz already started, enforce validations
      const user = localStorage.getItem("user");
      if (!user) {
        setShowRegister(true);
        setIsInitializing(false);
        return;
      }
      const acknowledged = localStorage.getItem(`quiz-instructions-acknowledged-${params.id}`);
      if (!acknowledged) {
        router.replace(`/quizzes/${params.id}/instructions`);
        return;
      }
      setIsInitializing(false);
    }
  }, [params.id, router]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz(data);
        // Only set timer if timeLimit is a positive number
        if (data.timeLimit && data.timeLimit > 0) {
          setTimeLeft(data.timeLimit * 60); // Convert minutes to seconds
        } else {
          setTimeLeft(-1); // Special value for no/invalid time limit
        }
        setAnswers(new Array(data.questions.length).fill(-1));
        setQuestionStatuses(new Array(data.questions.length).fill(QuestionStatus.NotViewed));
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
        router.push('/quizzes');
      } finally {
        setLoading(false);
      }
    };

    if (!isInitializing && !showRegister) {
      fetchQuiz();
    }
  }, [params.id, router, isInitializing, showRegister]);

  // Timer effect
  useEffect(() => {
    // Only run timer if timeLeft is positive
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Warning effect
  useEffect(() => {
    if (timeLeft <= 300) { // 5 minutes
      setShowWarning(true);
    }
  }, [timeLeft]);

  const handleRegister = (user: { name: string, mobile: string }) => {
    localStorage.setItem("user", JSON.stringify(user));
    setShowRegister(false);
  };

  const showSubmitConfirmation = () => {
    const unanswered = answers.filter((answer) => answer === -1).length;

    if (unanswered > 0) {
      setConfirmModalData({
        title: "Submit Quiz?",
        message: "Are you sure you want to submit your quiz? This action cannot be undone.",
        confirmText: "Submit Quiz",
        cancelText: "Continue Quiz",
        type: "warning",
        unansweredCount: unanswered,
      });
    } else {
      setConfirmModalData({
        title: "Submit Quiz?",
        message: "You have answered all questions. Are you ready to submit your quiz?",
        confirmText: "Submit Quiz",
        cancelText: "Review Answers",
        type: "success",
        unansweredCount: 0,
      });
    }

    setShowConfirmModal(true);
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    if (!quiz) {
      toast.error("Quiz data is missing. Please reload the page.");
      return;
    }

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
    if (!user || !user.mobile) {
      toast.error("User not found. Please register again.");
      setShowRegister(true);
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting quiz attempt with quizId:", quiz._id, "userId:", user.mobile, "answers:", answers);
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz._id,
          userId: user.mobile,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const attempt = await response.json();
      toast.success('Quiz submitted successfully!');
      router.push(`/quizzes/${params.id}/results?attemptId=${attempt._id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
      setSubmitting(false);
    }
  }, [submitting, answers, quiz, params.id, router, setShowRegister]);

  // Handle time expiration
  useEffect(() => {
    // Only trigger expiration if timeLeft is zero and was set from a valid timeLimit
    if (timeLeft === 0 && quiz && quiz.timeLimit && quiz.timeLimit > 0 && !submitting) {
      setConfirmModalData({
        title: "Time Expired!",
        message: "Your quiz time has expired. Your answers will be automatically submitted.",
        confirmText: "Submit Now",
        cancelText: "",
        type: "danger",
        unansweredCount: answers.filter((answer) => answer === -1).length,
      });
      setShowConfirmModal(true);
      setTimeout(() => {
        handleSubmit();
        // After 3 seconds, reset the quiz state so user can start again
        setTimeout(() => {
          // Reset quiz state to initial
          setCurrentQuestion(0);
          setAnswers(new Array(quiz.questions.length).fill(-1));
          setQuestionStatuses(new Array(quiz.questions.length).fill(QuestionStatus.NotViewed));
          setTimeLeft(quiz.timeLimit * 60);
          setShowConfirmModal(false);
        }, 3000);
      }, 3000);
    }
  }, [timeLeft, submitting, handleSubmit, answers, quiz]);

  const handleAnswerChange = (value: string) => {
    // Mark quiz as started on first answer
    if (typeof window !== "undefined") {
      const quizStarted = localStorage.getItem(`quiz-started-${params.id}`);
      if (!quizStarted) {
        localStorage.setItem(`quiz-started-${params.id}`, "true");
      }
    }
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);

    const newStatuses = [...questionStatuses];
    newStatuses[currentQuestion] = QuestionStatus.Attempted;
    setQuestionStatuses(newStatuses);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion((prev) => {
        const newStatuses = [...questionStatuses];
        if (newStatuses[prev] === QuestionStatus.NotViewed) {
          newStatuses[prev] = QuestionStatus.Viewed;
        }
        setQuestionStatuses(newStatuses);
        return prev + 1;
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => {
        const newStatuses = [...questionStatuses];
        if (newStatuses[prev] === QuestionStatus.NotViewed) {
          newStatuses[prev] = QuestionStatus.Viewed;
        }
        setQuestionStatuses(newStatuses);
        return prev - 1;
      });
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestion(index);
    const newStatuses = [...questionStatuses];
    if (newStatuses[index] === QuestionStatus.NotViewed) {
      newStatuses[index] = QuestionStatus.Viewed;
    }
    setQuestionStatuses(newStatuses);
  };

  const handleMarkForReview = () => {
    const newStatuses = [...questionStatuses];
    if (newStatuses[currentQuestion] === QuestionStatus.Attempted) {
      newStatuses[currentQuestion] = QuestionStatus.AttemptedAndMarkedForReview;
    } else {
      newStatuses[currentQuestion] = QuestionStatus.ToReview;
    }
    setQuestionStatuses(newStatuses);
  };

  const handleClearResponse = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = -1;
    setAnswers(newAnswers);

    const newStatuses = [...questionStatuses];
    if (newStatuses[currentQuestion] === QuestionStatus.Attempted) {
      newStatuses[currentQuestion] = QuestionStatus.Viewed;
    } else if (newStatuses[currentQuestion] === QuestionStatus.AttemptedAndMarkedForReview) {
      newStatuses[currentQuestion] = QuestionStatus.ToReview;
    } else if (newStatuses[currentQuestion] === QuestionStatus.ToReview) {
      newStatuses[currentQuestion] = QuestionStatus.Viewed;
    }
    setQuestionStatuses(newStatuses);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles only once on mount
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  // Set language from localStorage or default to 'en' on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lang');
      if (stored === 'hi' || stored === 'en') {
        setLang(stored);
      } else {
        setLang('en');
      }
    }
  }, []);

  // When user switches language, persist it
  const handleLangSwitch = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', nextLang);
    }
  };

  // Show register modal if user is not registered
  if (showRegister) {
    return <AuthModal onSuccess={handleRegister} />;
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin">
            <div
              className="absolute inset-2 border-4 border-magenta-400/50 rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            >
              <div>
                {(() => {
                  if (typeof window === 'undefined') return null;
                  const userData = localStorage.getItem('user');
                  if (!userData) return null;
                  try {
                    const user = JSON.parse(userData);
                    return (
                      <>
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                          Welcome, {user.name}! 
                        </h2>
                        <p className="text-emerald-200 text-sm sm:text-base">
                          Ready to take on {title}
                        </p>
                      </>
                    );
                  } catch (e) {
                    return null; // Avoids crashing if JSON is invalid
                  }
                })()}
              </div>
              <div className="absolute inset-2 border-4 border-lime-400/70 rounded-full animate-spin">
                <div className="absolute inset-2 bg-gradient-to-br from-cyan-400 to-magenta-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
          <p className="text-cyan-400 font-bold text-lg mt-8 text-center animate-pulse">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="relative">
          {/* Multi-layered loading spinner */}
          <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin">
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
          <p className="text-cyan-400 font-bold text-lg mt-8 text-center animate-pulse">
            Started Test...
          </p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
        <Card
          className="border-0 bg-black/80 backdrop-blur-sm shadow-2xl"
          style={{
            clipPath: "polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 5% 100%, 0% 95%)",
            background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,10,46,0.9) 50%, rgba(0,0,0,0.9) 100%)",
          }}
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Neural Interface Not Found
          </h1>
          <Button
            onClick={() => router.push("/quizzes")}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-8 py-3"
          >
            Return to Hub
          </Button>
        </Card>
      </div>
    );
  }

  // Show a message if no valid time limit is set
  if (quiz && (!quiz.timeLimit || quiz.timeLimit <= 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
        <Card className="border-0 bg-black/80 backdrop-blur-sm shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            No Time Limit Set For This Quiz
          </h1>
          <p className="text-gray-300 mb-8">Please contact the administrator to set a valid time limit for this quiz.</p>
          <Button onClick={() => router.push("/quizzes")} className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold px-8 py-3">
            Return to Hub
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredQuestions = answers.filter((answer) => answer !== -1).length;

  if (!lang) return null; // or a loading spinner

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-2 sm:p-4">
          {/* Floating particles background */}
          {mounted && (
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    animation: `float ${p.duration}s ease-in-out infinite ${p.delay}s`,
                    boxShadow: "0 0 4px currentColor",
                  }}
                />
              ))}
            </div>
          )}

          <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 relative z-10">
            

            {/* Main Interface Container */}
            <div
              className="relative overflow-hidden border-0 bg-black/80 backdrop-blur-sm shadow-2xl"
              style={{
                clipPath: "polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 5% 100%, 0% 95%)",
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,10,46,0.9) 25%, rgba(22,33,62,0.9) 50%, rgba(15,52,96,0.9) 75%, rgba(0,0,0,0.9) 100%)",
              }}
            >
              {/* Animated border */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 opacity-50 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-lime-400 via-cyan-400 to-magenta-400 opacity-50 animate-pulse" />

              {/* Header Section */}
              <CardHeader className="border-b border-cyan-400/30 bg-gradient-to-r from-black/50 to-purple-900/30 backdrop-blur-sm p-4 sm:p-6">
                {/* User Profile Display */}
                {(() => {
                  const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
                  const user = userData ? JSON.parse(userData) : null;
                  return user ? (
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-magenta-500 flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            {user.name}
                          </h3>
                          {/* <p className="text-cyan-300 text-sm sm:text-base">
                            Neural Interface Active
                          </p> */}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div className="text-center mb-4 sm:mb-6">
                  <CardTitle className="text-2xl sm:text-4xl font-black mb-2">
                    <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent animate-pulse">
                      {quiz.title}
                    </span>
                  </CardTitle>
                  <p className="text-cyan-300 text-base sm:text-lg font-semibold">{quiz.description}</p>
                </div>

                {/* Stats Grid - Futuristic Design */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                  {/* Time Left */}
                  <div className="relative group">
                    <div
                      className="p-3 sm:p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-400/30 transform group-hover:scale-105 transition-transform duration-300"
                      style={{ clipPath: "polygon(0% 0%, 90% 0%, 100% 25%, 100% 100%, 10% 100%, 0% 75%)" }}
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 animate-pulse" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-black text-red-400">
                            {minutes}:{seconds.toString().padStart(2, "0")}
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-red-300 uppercase tracking-wider">Time Quantum</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answered Questions */}
                  <div className="relative group">
                    <div
                      className="p-3 sm:p-4 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 backdrop-blur-sm border border-lime-400/30 transform group-hover:scale-105 transition-transform duration-300"
                      style={{ clipPath: "polygon(10% 0%, 100% 0%, 100% 75%, 90% 100%, 0% 100%, 0% 25%)" }}
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-lime-400 animate-pulse" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-black text-lime-400">
                            {answeredQuestions}/{quiz.questions.length}
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-lime-300 uppercase tracking-wider">Completed</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Question */}
                  <div className="relative group">
                    <div
                      className="p-3 sm:p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 transform group-hover:scale-105 transition-transform duration-300"
                      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
                    >
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 animate-spin" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-black text-cyan-400">
                            {currentQuestion + 1}/{quiz.questions.length}
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-cyan-300 uppercase tracking-wider">Current Questions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="h-2 sm:h-3 bg-black/50 rounded-full border border-cyan-400/30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 transition-all duration-500 relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 p-4 sm:p-8">
                {/* Question Section */}
                <div className="lg:col-span-3">
                  <Card className="border-0 bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="border-b border-magenta-400/30 p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-magenta-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-magenta-400 uppercase tracking-wider">Neural Query</div>
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                        {currentQuestionData.text}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-4 sm:pt-6">
                      <RadioGroup
                        value={answers[currentQuestion]?.toString() || ""}
                        onValueChange={handleAnswerChange}
                        className="space-y-3 sm:space-y-4"
                      >
                        {currentQuestionData.options.map((option, index) => (
                          <div
                            key={index}
                            className={`group relative p-3 sm:p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                              answers[currentQuestion] === index
                                ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20"
                                : "border-gray-600/50 bg-black/20 hover:border-magenta-400/50 hover:bg-magenta-400/5"
                            }`}
                            onClick={() => handleAnswerChange(index.toString())}
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="relative">
                                <RadioGroupItem
                                  value={index.toString()}
                                  id={`option-${index}`}
                                  className="h-5 w-5 sm:h-6 sm:w-6 border-2 border-cyan-400 text-cyan-400"
                                />
                                {answers[currentQuestion] === index && (
                                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse" />
                                )}
                              </div>
                              <Label
                                htmlFor={`option-${index}`}
                                className="text-gray-200 cursor-pointer flex-1 font-medium text-base sm:text-lg"
                              >
                                {option}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={handleClearResponse}
                        className="border-2 border-red-400 text-red-400 bg-transparent hover:bg-red-400/10 font-bold px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg hover:shadow-red-400/20 text-sm sm:text-base"
                      >
                        Clear Response
                      </Button>
                      <Button
                        onClick={handleMarkForReview}
                        className="border-2 border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-400/10 font-bold px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 text-sm sm:text-base"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Mark for Review
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400/10 font-bold px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 disabled:opacity-50 text-sm sm:text-base"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {currentQuestion === quiz.questions.length - 1 ? (
                        <Button
                          onClick={showSubmitConfirmation}
                          disabled={submitting}
                          className="bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 text-black font-black px-6 sm:px-8 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg hover:shadow-lime-400/30 text-sm sm:text-base"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                              Submitting...
                            </span>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Submit Quiz
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          className="bg-gradient-to-r from-magenta-400 to-purple-500 hover:from-magenta-500 hover:to-purple-600 text-white font-black px-6 sm:px-8 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg hover:shadow-magenta-400/30 text-sm sm:text-base"
                        >
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Overview Sidebar */}
                <div className="lg:col-span-1">
                  <div
                    className="p-4 sm:p-6 bg-gradient-to-br from-black/80 to-purple-900/40 backdrop-blur-sm border border-cyan-400/30 shadow-2xl"
                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 0% 100%)" }}
                  >
                    <h3 className="text-lg sm:text-xl font-black text-cyan-400 mb-4 sm:mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hexagon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-green-500"></span>
                        </span>
                        <span className="text-green-400 animate-pulse text-xs sm:text-sm font-semibold">Active</span>
                      </div>
                    </h3>

                    {/* Question Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-6 sm:mb-8">
                      {quiz.questions.map((_, index) => {
                        const status = questionStatuses[index] || QuestionStatus.NotViewed;
                        const isActive = currentQuestion === index;

                        return (
                          <Button
                            key={index}
                            onClick={() => handleQuestionNavigation(index)}
                            className={`
                              relative w-8 h-8 sm:w-12 sm:h-12 rounded-lg font-black text-white transition-all duration-300 hover:scale-110
                              ${isActive ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black" : ""}
                              bg-gradient-to-br ${getStatusColor(status)}
                              hover:shadow-lg hover:shadow-current/30
                              text-sm sm:text-base
                            `}
                            style={{
                              clipPath:
                                index % 2 === 0
                                  ? "polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%)"
                                  : "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 25%)",
                            }}
                          >
                            {index + 1}
                            {isActive && (
                              <div className="absolute inset-0 bg-cyan-400/20 blur-sm animate-pulse rounded-lg" />
                            )}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Status Legend */}
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-xs sm:text-sm font-bold text-pink-400 uppercase tracking-wider">Status Questions</h4>
                      {[
                        {
                          status: QuestionStatus.Attempted,
                          label: "Completed",
                          color: "bg-gradient-to-r from-lime-400 to-lime-600",
                        },
                        {
                          status: QuestionStatus.Viewed,
                          label: "Incomplete",
                          color: "bg-gradient-to-r from-red-400 to-red-600",
                        },
                        {
                          status: QuestionStatus.NotViewed,
                          label: "Unvisited",
                          color: "bg-gradient-to-r from-gray-500 to-gray-700",
                        },
                        {
                          status: QuestionStatus.ToReview,
                          label: "Review Queue",
                          color: "bg-gradient-to-r from-cyan-400 to-cyan-600",
                        },
                      ].map(({ label, color }) => (
                        <div key={label} className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${color} shadow-lg`} />
                          <span className="text-gray-300 text-xs sm:text-sm font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSubmit}
          title={confirmModalData.title}
          message={confirmModalData.message}
          confirmText={confirmModalData.confirmText}
          cancelText={confirmModalData.cancelText}
          type={confirmModalData.type}
          unansweredCount={confirmModalData.unansweredCount}
        />

        <div className="flex justify-end mb-4">
          <Button onClick={handleLangSwitch} variant="outline">
            {lang === 'en' ? 'हिंदी' : 'English'}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
} 