"use client"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Clock, FileText, Trophy, ArrowRight, Sparkles, UserIcon, LogOut, Globe, CheckCircle2 } from "lucide-react"
import AuthModal from "@/components/AuthModal"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select"

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
  totalMarks: number
  questions: Array<{
    _id: string
    text: string
    options: string[]
    correctAnswer: number
  }>
  attempts?: Array<{
    _id: string
    userId: string
    score: number
    completedAt: string
  }>
  createdAt?: string
  updatedAt?: string
  category: string;
  subcategory: string;
}

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const supportedLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
]

const translations = {
  en: {
    welcome: "Welcome",
    ready: "Are you Ready Test?",
    logout: "Logout",
    availableTests: "Available Tests",
    questions: "Questions",
    marks: "Marks",
    minutes: "Minutes",
    testStart: "Test Start",
    language: "Language",
    selectLanguage: "Select Language",
    languageChanged: "Language changed successfully!",
    noQuizzes: "No Quizzes Available",
    noQuizzesDesc: "There are no quizzes available at the moment.",
    loading: "Loading...",
    TestInstructions: "Test Instructions",
  },
  hi: {
    welcome: "स्वागत है",
    ready: "क्या आप Exam के लिए तैयार हैं?",
    logout: "लॉग आउट",
    availableTests: "उपलब्ध परीक्षाएं",
    questions: "प्रश्न",
    marks: "अंक",
    minutes: "मिनट",
    testStart: "परीक्षा शुरू करें",
    language: "भाषा",
    TestInstructions:"परीक्षण निर्देश",
    selectLanguage: "भाषा चुनें",
    languageChanged: "भाषा सफलतापूर्वक बदल दी गई!",
    noQuizzes: "कोई प्रश्नोत्तरी उपलब्ध नहीं",
    noQuizzesDesc: "इस समय कोई प्रश्नोत्तरी उपलब्ध नहीं है COMMING SOON....।",
    loading: "लोड हो रहा है...",
  },
 
}

function QuizListContent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedInUser, setLoggedInUser] = useState<{ _id: string; name: string; mobile: string } | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")
  const [languageLoading, setLanguageLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams();
  const category = searchParams?.get("category");
  const subcategory = searchParams?.get("subcategory");

  // Get current translations
  const t = translations[currentLanguage as keyof typeof translations] || translations.en

  useEffect(() => {
    // Get user and language preference from localStorage
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          setLoggedInUser(JSON.parse(userData))
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }

      // Get saved language preference
      const savedLanguage = localStorage.getItem("preferredLanguage")
      if (savedLanguage && supportedLanguages.find((lang) => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage)
      }
    }

    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/quizzes")
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes")
        }
        const data = await response.json()
        console.log("Fetched quizzes data:", data)
        setQuizzes(data.data)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        toast.error("Failed to load quizzes")
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setLoggedInUser(null)
    toast.success("Logged out successfully")
  }

  const handleAuthSuccess = (user: { _id: string; name: string; mobile: string }) => {
    setLoggedInUser(user)
    toast.success(`${t.welcome}, ${user.name}!`)
  }

  const handleLanguageChange = async (languageCode: string) => {
    // Validate language code
    const selectedLanguage = supportedLanguages.find((lang) => lang.code === languageCode)

    if (!selectedLanguage) {
      toast.error("Invalid language selection")
      return
    }

    if (languageCode === currentLanguage) {
      toast.info("Language is already selected")
      return
    }

    setLanguageLoading(true)

    try {
      // Simulate API call for language change validation
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update language
      setCurrentLanguage(languageCode)

      // Save to localStorage
      localStorage.setItem("preferredLanguage", languageCode)

      // Show success message
      const newTranslations = translations[languageCode as keyof typeof translations] || translations.en
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>
            {selectedLanguage.flag} {newTranslations.languageChanged}
          </span>
        </div>,
      )
    } catch (error) {
      console.error("Error changing language:", error)
      toast.error("Failed to change language. Please try again.")
    } finally {
      setLanguageLoading(false)
    }
  }

  // Filter quizzes based on category and subcategory
  const filteredQuizzes = quizzes.filter((quiz) => {
    if (category && subcategory) {
      return quiz.category === category && quiz.subcategory === subcategory;
    } else if (category) {
      return quiz.category === category;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a124d]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white font-semibold">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (filteredQuizzes.length === 0) {
    return (
      <>
      <Header />
      <div className="container mx-auto py-8 bg-[#1a124d] ">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">{t.noQuizzes}</h1>
          <p className="text-gray-300 mb-8">{t.noQuizzesDesc}</p>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  return (
    <div className="container bg-[#1a124d] ">
      <Header />
      {/* User Profile Section */}
      {loggedInUser && (
        <div className=" sm:px-10 md:px-12 lg:px-28 py-2">
          <Card className="border-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm shadow-xl max-w-7xl mx-auto">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {t.welcome}, {loggedInUser.name}
                    </h2>
                    <p className="text-emerald-200 text-sm sm:text-base">{t.ready}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <select
                      value={currentLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                    </select>
                  </div>

                 
                </div>
              </div>

             
            </CardContent>
          </Card>
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8 text-white flex justify-center">{t.availableTests}</h1>
       {/* Language Loading Indicator */}
       {languageLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-400"></div>
                  <span className="text-sm">Changing language...</span>
                </div>
              )}
      <div className="grid sm:gap-2 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {filteredQuizzes.map((quiz) => (
          <Card
            key={quiz._id}
            className="group relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100  transition-all duration-500 w-full  m-2  hover:-translate-y-2 hover:rotate-1"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-coral-400 to-orange-400 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full blur-2xl animate-pulse delay-500" />
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-transparent to-coral-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-coral-500 via-amber-500 via-teal-500 to-emerald-500" />
            <div className="absolute top-2 right-4 w-3 h-3 bg-coral-400 rounded-full animate-ping" />
            <div className="absolute top-6 right-8 w-2 h-2 bg-teal-400 rounded-full animate-ping delay-300" />

            <CardHeader className="relative pb-4 sm:pb-6 pt-6 sm:pt-8">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-coral-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <FileText className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
                <div className="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg animate-bounce">
                  ✨ Live
                </div>
              </div>

              <CardTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-700 to-emerald-700 bg-clip-text text-transparent leading-tight line-clamp-2 min-h-[3rem] sm:min-h-[4rem]">
                {quiz.description}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative pt-2">
              {/* Stats Grid with unique design */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="relative text-center p-2 sm:p-4 rounded-2xl bg-gradient-to-br from-coral-100 to-orange-100 border-2 border-coral-200/50 shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-coral-500 to-orange-500 rounded-full flex items-center justify-center">
                    <FileText className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <p className="text-xl sm:text-3xl font-black text-coral-600 mb-1">{quiz.questions.length}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-coral-700 uppercase tracking-wider">
                    {t.questions}
                  </p>
                </div>

                <div className="relative text-center p-2 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-200/50 shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <p className="text-xl sm:text-3xl font-black text-amber-600 mb-1">{quiz.totalMarks}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider">{t.marks}</p>
                </div>

                <div className="relative text-center p-2 sm:p-4 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 border-2 border-teal-200/50 shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <p className="text-xl sm:text-3xl font-black text-teal-600 mb-1">{quiz.timeLimit}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-teal-700 uppercase tracking-wider">{t.minutes}</p>
                </div>
              </div>

              {/* Action Button with unique design */}
              <Link href={`/quizzes/${quiz._id}/instructions`} className="block">
                <Button className="relative w-full bg-gradient-to-r from-coral-500 via-orange-500 to-amber-500 hover:from-coral-600 hover:via-orange-600 hover:to-amber-600 text-white font-bold py-3 sm:py-5 rounded-2xl shadow-2xl hover:shadow-coral-500/25 transition-all duration-300 group/btn overflow-hidden">
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                  <span className="relative flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    {t.testStart}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-all duration-300" />
                  </span>

                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </Link>

              {/* Decorative floating elements */}
              <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-coral-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute -top-4 -right-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-full blur-xl animate-pulse delay-700" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
        onClick={handleLogout}
        variant="outline"
        className=" border border-emerald-400 text-emerald-400 bg-red-500 hover:text-white hover:border-white transition-colors duration-300"
      >
        <LogOut className="w-4 h-4" />
        {t.logout}
      </Button>
      </div>
          
      <Footer />
    </div>
   
  )
}

export default function QuizList() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizListContent />
    </Suspense>
  );
}
