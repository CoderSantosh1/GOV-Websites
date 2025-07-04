'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import NewsForm from './NewsForm';

interface News {
  _id: string;
  title: string;
  content: string;
  organization: string;
  category: string;
  status: string;
  postedDate: string;
  imageUrl?: string;
  image?: string;
}

interface NewsFormData {
  title: string;
  content: string;
  organization: string;
  category: string;
  status: string;
  postedDate?: string;
  image?: File | string;
}

export default function NewsList() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setError(null);
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        const sortedNews = data.data.sort((a: News, b: News) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        setNews(sortedNews);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch news');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Error loading news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async (formData: NewsFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('organization', formData.organization);
      data.append('category', formData.category);
      data.append('status', formData.status);
      if (
        formData.image &&
        typeof formData.image === 'object' &&
        typeof (formData.image as File).size === 'number' &&
        typeof (formData.image as File).type === 'string'
      ) {
        data.append('image', formData.image as File);
      }
      if ('postedDate' in formData && formData.postedDate) {
        data.append('publishDate', formData.postedDate as string);
      }
      const response = await fetch('/api/news', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setNews(prev => [result.data, ...prev]);
        setIsFormOpen(false);
        alert('News created successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Failed to create news');
      }
    } catch (err) {
      console.error('Error creating news:', err);
      alert('Error creating news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNews = async (formData: NewsFormData) => {
    if (!selectedNews || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('organization', formData.organization);
      data.append('category', formData.category);
      data.append('status', formData.status);
      if (
        formData.image &&
        typeof formData.image === 'object' &&
        typeof (formData.image as File).size === 'number' &&
        typeof (formData.image as File).type === 'string'
      ) {
        data.append('image', formData.image as File);
      }
      if ('postedDate' in formData && formData.postedDate) {
        data.append('publishDate', formData.postedDate as string);
      }
      const response = await fetch(`/api/news/${selectedNews._id}`, {
        method: 'PUT',
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setNews(prev =>
          prev.map(item => (item._id === selectedNews._id ? result.data : item))
        );
        setIsFormOpen(false);
        setSelectedNews(null);
        alert('News updated successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Failed to update news');
      }
    } catch (err) {
      console.error('Error updating news:', err);
      alert('Error updating news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNews(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Error deleting news:', err);
    }
  };

  const handleOpenForm = () => {
    if (isFormOpen) return;
    setSelectedNews(null);
    setIsFormOpen(true);
  };

  const handleEdit = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSelectedNews(null);
  };

  if (loading) return <div className="text-center">Loading...</div>;

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-red-600 font-bold">Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Posted News</h2>
        <Button onClick={handleOpenForm} disabled={isFormOpen || isSubmitting}>
          Add News
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <NewsForm
              key={selectedNews ? selectedNews._id : 'new'}
              initialData={selectedNews || undefined}
              onSubmit={selectedNews ? handleUpdateNews : handleCreateNews}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {news.length === 0 ? (
          <p className="text-gray-500 text-center">No news posted yet</p>
        ) : (
          news.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-contain rounded border shadow"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.organization}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.postedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteNews(item._id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
