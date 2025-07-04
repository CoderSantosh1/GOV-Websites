import Link from "next/link";


export default function Header() {
  return (
    <div className="w-full bg-[#1a124d]">
    <header className="bg-[#A92E2E] w-10/14 max-w-7xl mx-auto shadow-md">
      <div className="container mx-auto ">
        {/* Top Section with Logo */}
        <div className="flex flex-col items-center border-b border-gray-200">
          <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#000000]">SARKARIRESULTSNOW</h1>
     
</div>
          <p className="text-sm text-[#000000] hover:text-blue-800"><a href="https://www.sarkariresultsnow.com/">WWW.SARKARIRESULTSNOW.COM</a></p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-wrap justify-center gap-4 py-1">
          <Link href="/" className="text-[#000000] hover:text-blue-800 font-medium">Home</Link>
          <Link href="/quizzes" className="text-[#000000] hover:text-blue-800 font-medium">Free Test Series</Link>
          <Link href="/jobs" className="text-[#000000] hover:text-blue-800 font-medium">Jobs</Link>
          <Link href="/results" className="text-[#000000] hover:text-blue-800 font-medium">Results</Link>
          <Link href="/news" className="text-[#000000] hover:text-blue-800 font-medium">News</Link>
          <Link href="/admit-cards" className="text-[#000000] hover:text-blue-800 font-medium">Admit Card</Link>
          <Link href="/answer-keys" className="text-[#000000] hover:text-blue-800 font-medium">Answer Key</Link>
          <Link href="/contact" className="text-[#000000]hover:text-blue-800 font-medium">Contact Us</Link>
        </nav>
      </div>
    </header>
    </div>
  );
}
