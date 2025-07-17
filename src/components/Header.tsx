"use client";

import Link from "next/link";
import FreeTestSeriesMegaMenu from "./FreeTestSeriesMegaMenu";
import { useState } from "react";

export default function Header() {

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="w-full bg-[#1a124d]">
      <header className="bg-[#A92E2E] w-10/14 max-w-7xl mx-auto shadow-md border-b border-gray-300">
        <div className="container mx-auto">
          {/* Top Section with Logo */}
          <div className="flex flex-col items-center py-4 md:py-0 px-3">
            <div className="flex items-center w-full justify-between md:justify-center min-h-[60px]">
              <div className="flex items-center gap-3 md:gap-4">
                <h1 className="text-[1.5rem] md:text-3xl font-bold text-[#000000]">SARKARIRESULTSNOW</h1>
              </div>
              {/* Hamburger for mobile */}
              <button
                className="md:hidden p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
                aria-label="Open navigation menu"
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-400 hover:text-blue-800 text-center w-full mt-2 md:mt-0 tracking-wider font-semibold"><a href="https://www.sarkariresultsnow.com/">WWW.SARKARIRESULTSNOW.COM</a></p>
          </div>

          {/* Navigation Menu */}
          {/* Desktop nav */}
          <nav className="hidden md:flex flex-wrap justify-center gap-4 py-1">
            <Link href="/" className="text-[#000000] hover:text-blue-800 font-medium">Home</Link>
            <FreeTestSeriesMegaMenu />
            <Link href="/jobs" className="text-[#000000] hover:text-blue-800 font-medium">Jobs</Link>
            <Link href="/results" className="text-[#000000] hover:text-blue-800 font-medium">Results</Link>
            <Link href="/news" className="text-[#000000] hover:text-blue-800 font-medium">News</Link>
            <Link href="/admit-cards" className="text-[#000000] hover:text-blue-800 font-medium">Admit Card</Link>
            <Link href="/answer-keys" className="text-[#000000] hover:text-blue-800 font-medium">Answer Key</Link>
            <Link href="/contact" className="text-[#000000] hover:text-blue-800 font-medium">Contact Us</Link>
          </nav>
          {/* Mobile nav dropdown */}
          {mobileNavOpen && (
            <nav className="md:hidden flex flex-col gap-2 py-2 bg-[#A92E2E] rounded-b shadow-lg animate-fade-in z-50">
              <Link href="/" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>Home</Link>
              <div className="px-4"><FreeTestSeriesMegaMenu /></div>
              <Link href="/jobs" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>Jobs</Link>
              <Link href="/results" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>Results</Link>
              <Link href="/news" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>News</Link>
              <Link href="/admit-cards" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>Admit Card</Link>
              <Link href="/answer-keys" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>Answer Key</Link>
              <Link href="/contact" className="text-[#000000] hover:text-blue-800 font-medium px-4 py-2" onClick={() => setMobileNavOpen(false)}>Contact Us</Link>
            </nav>
          )}
        </div>
      </header>
    </div>
  );
}
