'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Header';
import Footer from '@/components/Footer';

interface News {
  _id: string;
  title: string;
  organization: string;
  content: string;
  category: string;
  postedDate: string;
  status: string;
  image?: string;
  imageUrl?: string;
}

export default function NewsDetail() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');

        if (!params || !params.id) {
          setError('Invalid parameters');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/news/${params.id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            response.status === 404 ? 'News not found' : errorText || 'Failed to fetch news details'
          );
        }

        const data = await response.json();
        if (!data.data) {
          throw new Error('News data is missing');
        }

        setNews(data.data);
        setRetryCount(0);
      } catch (err) {
        console.error('Error fetching news:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error fetching news details';
        setError(errorMessage);

        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchNews(), 1000 * (retryCount + 1));
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchNews();
    }
  }, [params?.id, retryCount]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="mb-2">Loading...</div>
        {retryCount > 0 && (
          <div className="text-sm text-gray-500">
            Retry attempt {retryCount} of {maxRetries}...
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        {retryCount < maxRetries && (
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
        <button
          onClick={() => router.back()}
          className="mt-4 text-gray-600 hover:text-gray-900"
        >
          ← Back to News
        </button>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-gray-700 mb-4">News not found</div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to News
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
            <div className="text-gray-600 mb-2">{news.organization}</div>
            <div className="text-sm text-red-500 mb-6">
              Posted Date: {new Date(news.postedDate).toLocaleDateString()}
            </div>

            

            {/* News Content */}
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {news.content}
            </div>
          {/* Image Display - Fully Responsive and Scales on Hover for Desktop */}
          {news.imageUrl && (
            <div className="mb-6 flex justify-center">
              <div className="w-full sm:w-auto max-w-full overflow-hidden rounded border shadow transition-transform duration-300 hover:scale-105">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
            {/* Back Button */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
