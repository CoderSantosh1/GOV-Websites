import Link from "next/link";
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 ">
      <div className="container mx-auto px-4 py-6">
        {/* Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-bold text-red-600 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
              <li><Link href="/latest-jobs" className="text-blue-600 hover:text-blue-800">Latest Jobs</Link></li>
              <li><Link href="/results" className="text-blue-600 hover:text-blue-800">Results</Link></li>
              <li><Link href="/admit-card" className="text-blue-600 hover:text-blue-800">Admit Card</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-600 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/answer-key" className="text-blue-600 hover:text-blue-800">Answer Key</Link></li>
              <li><Link href="/syllabus" className="text-blue-600 hover:text-blue-800">Syllabus</Link></li>
              <li><Link href="/search" className="text-blue-600 hover:text-blue-800">Search</Link></li>
              <li><Link href="/contact-us" className="text-blue-600 hover:text-blue-800">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-600 mb-3">Contact Information</h3>
            <p className="text-gray-700 mb-2">email: <a href="mailto:sarkariresultsnow.com">support@sarkariresultsnow.com</a></p>
            
            <div className="flex space-x-6">
            <a href="https://chat.whatsapp.com/KQjW6a9HlDw8HAba4v3LBU" className="text-blue-600 hover:text-blue-800">
                <Image src="/whatspp.png" alt="Whatsapp" width={24} height={24} />
              </a>
            <a href="https://t.me/+edSF3XKgzRU0MTY1" className="text-blue-600 hover:text-blue-800">
                <Image src="/telegram.png" alt="Telogram" width={24} height={24} />
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-800">
                <Image src="/facebook.png" alt="Facebook" width={24} height={24} />
              </a>
              <a href="https://www.instagram.com/sarkariresultsnow/" className="text-blue-600 hover:text-blue-800">
                <Image src="/insta.png" alt="Instagram" width={24} height={24} />
              </a>             
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <p className="text-sm text-gray-600 text-center">
           Provide the best jobs and results, admitCard, Jobslatestnews, university result for students. We do not endorse any particular job or result.
          </p>
        </div>
        
        {/* Copyright */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-1">Sarkariresultsnow</h2>
          <p className="text-sm text-gray-600">WWW.sarkariresultsnow.COM</p>
          <p className="text-sm text-gray-600 mt-2">&copy; {new Date().getFullYear()} Sarkariresultsnow. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}