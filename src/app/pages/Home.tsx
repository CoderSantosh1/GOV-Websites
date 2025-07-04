"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import Quiz from "@/lib/models/Quiz";

interface Job {
  _id: string;
  title: string;
  organization: string;
  postedDate: string;
}

interface Result {
  _id: string;
  title: string;
  organization: string;
  resultDate: string;
}

interface AdmitCard {
  _id: string;
  title: string;
  organization: string;
  applicationDeadline: string;
}

interface News {
  _id: string;
  title: string;
  organization: string;
  content: string;
  postedDate: string;
}

interface AnswerKey {
  _id: string;
  title: string;
  organization: string;
  content: string;
  postedDate: string;
}

interface Admission {
  _id: string;
  title: string;
  organization: string;
  content: string;
  postedDate: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  totalMarks: number;
  timeLimit: number;
  questions: Array<{
    _id: string;
    text: string;
    
    options: string[];
    correctAnswer: number;
  }>;
  attempts?: Array<{
    _id: string;
    userId: string;
    score: number;
    completedAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/results'),
          fetch('/api/admit-cards'),
          fetch('/api/news'),
          fetch('/api/answer-keys'),
          fetch('/api/admissions'),
          fetch('/api/quizzes'),
        ]);

        const dataPromises = responses.map(res => res.ok ? res.json() : Promise.resolve({ data: [] }));
        const allData = await Promise.all(dataPromises);

        const [jobsData, resultsData, admitCardsData, newsData, answerKeysData, admissionsData, quizzesData] = allData;

        setJobs(jobsData.data?.sort((a: Job, b: Job) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()) || []);
        setResults(resultsData.data?.sort((a: Result, b: Result) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime()) || []);
        setAdmitCards(admitCardsData.data?.sort((a: AdmitCard, b: AdmitCard) => new Date(b.applicationDeadline).getTime() - new Date(a.applicationDeadline).getTime()) || []);
        setNews(newsData.data?.sort((a: News, b: News) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()) || []);
        setAnswerKeys(answerKeysData.data?.sort((a: AnswerKey, b: AnswerKey) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()) || []);
        setAdmissions(admissionsData.data?.sort((a: Admission, b: Admission) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()) || []);
        setQuizzes(quizzesData.data?.sort((a: Quiz, b: Quiz) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          }) || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('Current quizzes state:', quizzes);
  }, [quizzes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 bg-[#1a124d]"></div>
      </div>
    );
  }

  console.log('Rendering with quizzes:', quizzes);

  return (
    <>
      <Header />
      <div className="bg-[#1a124d]">
      <main className="flex flex-col items-center justify-center bg-[#FFFBD9] w-full max-w-7xl mx-auto px-2 sm:px-4">
                <div className="w-full space-y-6 py-4">

                <div className="w-full  overflow-hidden">
                      <div className="inline-block whitespace-nowrap animate-marquee text-sm sm:text-base">
                  
                      {(
                [
                  ...results.slice(0, 5),
                  ...jobs.slice(0, 5),
                  ...admitCards.slice(0, 5),
                ] as (Result | Job | AdmitCard)[]
              ).reduce<React.ReactNode[]>((acc, item, idx) => {
                const baseColors = [
                  "text-red-500",
                  "text-green-500",
                  "text-blue-500",
                  "text-yellow-500",
                  "text-purple-500",
                  "text-pink-500",
                  "text-orange-500",
                  "text-teal-500",
                  "text-indigo-500",
                  "text-rose-500"
                ];

                const hoverColors = [
                  "hover:text-blue-500",
                  "hover:text-pink-500",
                  "hover:text-orange-500",
                  "hover:text-purple-500",
                  "hover:text-green-500",
                  "hover:text-red-500",
                  "hover:text-yellow-500",
                  "hover:text-rose-500",
                  "hover:text-teal-500",
                  "hover:text-indigo-500"
                ];

                const colorClass = baseColors[idx % baseColors.length];
                const hoverClass = hoverColors[idx % hoverColors.length];

                const linkText = "organization" in item ? item.organization : "";

                const linkPath =
                  "resultDate" in item
                    ? `/results/${item._id}`
                    : "postedDate" in item
                    ? `/jobs/${item._id}`
                    : "applicationDeadline" in item
                    ? `/admit-cards/${item._id}`
                    : "#";

                if (idx !== 0) {
                  acc.push(
                    <span key={`sep-${idx}`} className="mx-1 text-gray-400">
                      |
                    </span>
                  );
                }

                acc.push(
                  <a
                    key={`item-${item._id}`}
                    href={linkPath}
                    className={`font-medium inline-block transition-colors duration-200 ${colorClass} ${hoverClass}`}
                  >
                    {linkText}
                  </a>
                );

                return acc;
              }, [])}


                  </div>
                </div>

      
                {/* Section 1: Results / Jobs / News */}
                 <div className="w-full">
                        <div className="w-full overflow-x-auto hide-scrollbar">
                          <table className="w-full table-fixed border-collapse border border-orange-500 text-xs sm:text-sm md:text-base">
                            <thead>
                              <tr className="bg-red-600 text-[#FCFCD8] font-bold">
                                <th className="p-2 text-center break-words whitespace-normal w-1/3">Result</th>
                                <th className="p-2 text-center break-words whitespace-normal w-1/3">Latest Jobs</th>
                                <th className="p-2 text-center break-words whitespace-normal w-1/3">Latest News</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: Math.min(10, Math.max(results.length, jobs.length, news.length)) }).map((_, index) => (
                                <tr key={index} className="border-t-2 border-red-500 hover:bg-[#FFF8CC]">
                                  <td className="p-2 border-x text-left align-top break-words whitespace-pre-wrap">
                                    {results[index] ? (
                                      <a href={`/results/${results[index]._id}`} className="text-[#014F59] hover:underline hover:text-blue-800">
                                        {results[index].title}
                                      </a>
                                    ) : "-"}
                                  </td>
                                  <td className="p-2 border-x text-left align-top break-words whitespace-pre-wrap">
                                    {jobs[index] ? (
                                      <a href={`/jobs/${jobs[index]._id}`} className="text-[#014F59] hover:underline hover:text-blue-800">
                                        {jobs[index].title}
                                      </a>
                                    ) : "-"}
                                  </td>
                                  <td className="p-2 text-left align-top break-words whitespace-pre-wrap">
                                    {news[index] ? (
                                      <a href={`/news/${news[index]._id}`} className="text-[#014F59] hover:underline hover:text-blue-800">
                                        {news[index].title}
                                      </a>
                                    ) : "-"}
                                  </td>
                                </tr>
                              ))}
                              {(results.length > 10 || jobs.length > 10 || news.length > 10) && (
                                <tr className=" hover:bg-[#FFF8CC]">
                                  <td className=" text-center ">
                                    {results.length > 10 && (
                                      <a href="/results" className="text-blue-600 font-semibold hover:underline">See More</a>
                                    )}
                                  </td>
                                  <td className="p-2 border-x text-center align-top break-words whitespace-pre-wrap">
                                    {jobs.length > 10 && (
                                      <a href="/jobs" className="text-blue-600 font-semibold hover:underline">See More</a>
                                    )}
                                  </td>
                                  <td className="text-center ">
                                    {news.length > 10 && (
                                      <a href="/news" className="text-blue-600 font-semibold hover:underline">See More</a>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    {/* Section 2: Admit Card / Answer Key / Admission */}
                    <div className="w-full">
                    <div className="w-full overflow-x-auto hide-scrollbar">
                      <table className="w-full table-fixed border-collapse border border-orange-500 text-xs sm:text-sm md:text-base">
                        <thead>
                          <tr className="bg-red-600 text-[#FCFCD8] font-bold">
                            <th className="p-2 text-center break-words whitespace-normal w-1/3">Admit Card</th>
                            <th className="p-2 text-center break-words whitespace-normal w-1/3">Answer Key</th>
                            <th className="p-2 text-center break-words whitespace-normal w-1/3">Admission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: Math.min(10, Math.max(admitCards.length, answerKeys.length, admissions.length)) }).map((_, index) => (
                            <tr key={index} className="border-t-2 border-red-500 hover:bg-[#FFF8CC]">
                              <td className="p-2 border-x text-left align-top break-words whitespace-pre-wrap">
                                {admitCards[index] ? (
                                  <a href={`/admit-cards/${admitCards[index]._id}`} className="text-[#014F59] hover:underline hover:text-blue-800">
                                    {admitCards[index].title}
                                  </a>
                                ) : "-"}
                              </td>
                              <td className="p-2 border-x text-left align-top break-words whitespace-pre-wrap">
                                {answerKeys[index] ? (
                                  <a href={`/answer-keys/${answerKeys[index]._id}`} className="text-[#014F59] hover:underline hover:text-blue-800">
                                    {answerKeys[index].title}
                                  </a>
                                ) : "-"}
                              </td>
                              <td className="p-2 text-left align-top break-words whitespace-pre-wrap">
                                {admissions[index] ? (
                                  <a href={`/admissions/${admissions[index]._id}`} target="_blank" rel="noopener noreferrer" className="text-[#014F59] hover:underline hover:text-blue-800">
                                    {admissions[index].title}
                                  </a>
                                ) : "-"}
                              </td>
                            </tr>
                          ))}
                          {(admitCards.length > 10 || answerKeys.length > 10 || admissions.length > 10) && (
                            <tr className="hover:bg-[#FFF8CC]">
                              <td className="text-center ">
                                {admitCards.length > 10 && (
                                  <a href="/admit-cards" className="text-blue-600 font-semibold hover:underline">See More</a>
                                )}
                              </td>
                              <td className="p-2 border-x text-center align-top break-words whitespace-pre-wrap">
                                {answerKeys.length > 10 && (
                                  <a href="/answer-keys" className="text-blue-600 font-semibold hover:underline">See More</a>
                                )}
                              </td>
                              <td className="p-2 text-center align-top break-words whitespace-pre-wrap">
                                {admissions.length > 10 && (
                                  <a href="/admissions" className="text-blue-600 font-semibold hover:underline">See More</a>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    </div>

                      {/* Quiz Section */}
                      <div className="mt-8 px-4 sm:px-6 w-full max-w-screen overflow-x-hidden">
                        <div className="text-center">
                          <h2 className="text-blue-500 font-bold text-base sm:text-lg md:text-xl animate-marquee">
                            <a
                              href="/quizzes"
                              className="hover:text-blue-600 hover:underline block w-full text-sm"
                            >
                              Free Mock Tests for All Government Exams {""}  {quizzes.map(quiz => quiz.title).join(' | ')}
                            </a>
                          </h2>
                        </div>

                        {!quizzes || quizzes.length === 0 ? (
                          <div className="text-center py-6 bg-white rounded-lg shadow mt-4">
                            <p className="text-gray-500">No quizzes available at the moment.</p>
                            <p className="text-sm text-gray-400 mt-1">Check back later for new quizzes!</p>
                          </div>
                        ) : (
                          <div className="w-full mt-6">
                            <div className="bg-white border border-orange-500 rounded-md overflow-hidden shadow-sm w-full">
                              <div className="bg-red-600 text-[#FCFCD8] font-bold text-sm sm:text-base py-2 px-4 text-center w-full">
                                Free Test Series for All Government Exams
                              </div>
                              <ul className="divide-y divide-orange-300">
                                {quizzes.slice(0, 6).map((quiz) => (
                                  <li
                                    key={quiz._id}
                                    className="py-3 px-4 bg-[#FFF8CC] text-center break-words w-full"
                                  >
                                    <a
                                      href={`/quizzes`}
                                      className="text-[#014F59] hover:text-blue-900 font-medium text-sm sm:text-base hover:underline block w-full"
                                    >
                                      {quiz.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex justify-end mt-2 pr-2">
                              <a
                                href="/quizzes"
                                className="text-[#014F59] hover:text-[#014F59]/80 font-medium text-sm underline"
                              >
                                View All Test →
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                  </div>
                </main>
              </div>
              

       {/* Announcement Bars */}
       <div className="bg-[#1a124d] mb-4">
      <div className="flex flex-col items-center  justify-center bg-[#FFFBD9]  w-10/14 max-w-7xl mx-auto px-4 ">
        <AnnouncementBar title="Sarkari Results 10+2 Latest Job">
          Most Recent Sarkari Work, Sarkari Test Result, Most Recent On The Web And Disconnected Structure, Concede Card, Prospectus, Affirmation, Ansawer Key, Grant, Notice Etc.If You Need To Get Refreshes Connected With Sarkari Occupations On Sarkari Result.Com.Cm Like Concede Warning Like Govt. Test, Sarkari Result, Most Recent Bord Result, Bihar Result Tenth And So On You Could Sarkari Result 10+2 Most Recent Occupation At Any Point Website Page Consistently.
        </AnnouncementBar>
        <AnnouncementBar title="Sarkari Results">
          <b>Sarkari Results:</b> Sarkari Results Is A Famous Site In India That Gives Data About Sarkari Work Tests, Sarkari Result 2025, And Other Related Refreshes. It Is One Of The Notable Entries That Many Work Searchers Use To Secure Data About Government Position Opening, Concede Cards, Test Dates, And Results.
        </AnnouncementBar>
        <AnnouncementBar title="Sarkari Result Bihar">
          Each Data Connected With Sarkari Test Result In Bihar Can Be Seen As Here Like: OFSS Bihar, Bihar Board Tenth Outcome, Sarkari Result Bihar Board 2025, Bihar Board Matric 2025, Bihar Police 2025, Bihar Board Tenth, Bihar Ssc, Bihar Je, Bihar Common Court, Sarkari Result Bihar Board Result, Bihar Work, Bihar Result, Bihar 10+2 Most Recent Work, Bihar Sarkari Result , Bihar Sarkari Test, Bihar Govt Work, Concede Card, Bihar Sarkari Result, Eleventh Affirmation And So Forth.
        </AnnouncementBar>
        <AnnouncementBar title="Sarkari Result Hindi">
          Uttar Pradesh (Sarkariresult.Com.Cm UP Board) Is A State Where Lakhs Of Young People Give Sarkari Test Consistently To Land Government Positions, So Here UP Board Plays A Significant Part, So Here You Will Get Sarkari Result Up Board 2024, Up Barricade Result , Board 2025,Up Board Test Result, Sarkari Result Up Board Class Tenth, Up Board Result Date, Sarkari Result Up Board 2024 In Hindi And So On. Will Continue To Get Refreshes.
        </AnnouncementBar>
        <AnnouncementBar title="Sarkariresult">
          Sarkariresult: Data Presents To You All The Most Recent News Like Outcome, Online Structure, Naukri, Test Result 2025, Work Result, Information Hindi Test, Government Work Data, And Updates, Notice And Output Gives.
        </AnnouncementBar>
        <AnnouncementBar title="SarkariResultsNow.in">
          SarkariResultsNow.in is an independent portal dedicated to helping job seekers, students, and aspirants stay updated with the latest government job notifications, exam results, admit cards, answer keys, and current affairs.<br/>
          <br/>
          Our mission is to make public information more accessible by presenting updates from official government portals in a clean and organized format. We do not represent any government body, and all data shared here is sourced from publicly available and verified official announcements.<br/>
          <br/>
          If you have questions or concerns, feel free to contact us via the <a href="/contact" style={{textDecoration: 'underline', color: '#1a124d'}}>Contact</a> page.
        </AnnouncementBar>
      </div>
      </div>
      <Footer />
     
    </>
  );
}

