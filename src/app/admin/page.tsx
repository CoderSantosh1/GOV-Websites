'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import JobList from './components/JobList';
import ResultList from './components/ResultList';
import AdmitCard from './components/AdmitCardList';
import NewsList from './components/NewsList';
import AnswerKeyForm from './components/AnswerKeyForm';
import AnswerKeyList from './components/AnswerKeyList';
import AdmissionForm, { AdmissionFormData as AdmissionFormDataType } from './components/AdmissionForm';
import AdmissionList from './components/AdmissionList'; 
import JobForm from './components/JobForm'; 
import QuizForm from './components/QuizForm';
import QuizList from './components/QuizList';

interface NewsFormData {
  title: string;
  content: string;
  organization: string;
  category: string;
  status: string;
  publishDate: string;
  image?: File;
  imagePreview?: string;
}

interface JobFormData {
  title: string;
  organization: string;
  location: string;
  status: string;
  applicationDeadline: string;
  applyJob: string;
  description?: string;
  category?: string;
  salary?: string;
  minimumAge?: string;
  maximumAge?: string;
  gender?: string;
  qualification?: string;
  totalVacancy: string;
  requirements?: string[] | string; // Allow both array and comma-separated string
  applicationBeginDate?: string;
  lastDateApplyOnline?: string;
  formCompleteLastDate?: string;
  correctionDate?: string;
  examDate?: string;
  admitCardDate?: string;
  applicationFeeGeneral?: string;
  applicationFeeSCST?: string;
  paymentMethod?: string;
}

interface AdmitCardFormData {
  title: string;
  description: string;
  organization: string;
  subtitle: string;
  category: string;
  applicationDeadline: string;
  location: string;
  downloadAdmitcardLink: string;
}
interface ResultFormData {
  title: string;
  organization: string;
  resultDate: string;
  category: string;
  downloadLink: string;
  description: string;
  status: string;
}

type TabType = 'jobs' | 'results' | 'admit-cards' | 'news' | 'answer-keys' | 'admissions' | 'quizzes';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST'
      });
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [jobFormData, setJobFormData] = useState<JobFormData>({
    title: '',
    organization: '',
    location: '',
    status: 'published',
    applicationDeadline: '',
    applyJob: '',
    description: '',
    category: '',
    salary: '',
    minimumAge: '',
    maximumAge: '',
    gender: '',
    qualification: '',
    totalVacancy: '',
    requirements: '', // Initialize as empty string, JobForm will handle conversion
    applicationBeginDate: '',
    lastDateApplyOnline: '',
    formCompleteLastDate: '',
    correctionDate: '',
    examDate: '',
    admitCardDate: '',
    applicationFeeGeneral: '',
    applicationFeeSCST: '',
    paymentMethod: '',
  });

  const [admitCardFormData, setAdmitCardFormData] = useState<AdmitCardFormData>({
    title: '',
    description: '',
    organization: '',
    location: '',
    subtitle: '',
    applicationDeadline: '',
    category: '',
    downloadAdmitcardLink: '',
  });

  const [newsFormData, setNewsFormData] = useState<NewsFormData>({
    title: '',
    content: '',
    organization: '',
    category: '',
    status: 'published',
    publishDate: new Date().toISOString().split('T')[0]
  });

  const [resultsFormData, setResultsFormData] = useState<ResultFormData>({
    title: '',
    organization: '',
    resultDate: '',
    category: '',
    downloadLink: '',
    description: '',
    status: 'published'
  });

  const [answerKeyFormData, setAnswerKeyFormData] = useState({
    title: '',
    organization: '',
    examDate: '',
    category: '',
    downloadLink: '',
    description: '',
    content: '', // Added content field
    status: 'published'
  });

  const [jobListRefreshKey, setJobListRefreshKey] = useState(0);
  const [answerKeyListRefreshKey, setAnswerKeyListRefreshKey] = useState(0);
  const [admissionListRefreshKey, setAdmissionListRefreshKey] = useState(0); // Added for admissions list

  const [admissionFormData, setAdmissionFormData] = useState<AdmissionFormDataType>({
    title: '',
    organization: '',
    applicationDeadline: '', // Changed from admissionDate and ensured it's present
    category: '',
    description: '',
    content: '', // Added missing content field
    applicationLink: '',
    status: 'published'
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isLoggedIn) {
    return null;
  }

  const handleCreateJobSubmit = async (formData: JobFormData) => {
    // Basic client-side validation (already handled by JobForm, but can be kept for extra safety or specific logic here)
    if (!formData.title.trim()) {
      alert('Title is required.');
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      requirements: typeof formData.requirements === 'string'
        ? formData.requirements.split(',').map(req => req.trim()).filter(req => req)
        : formData.requirements,
    };

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        alert('Job posted successfully!');
        setJobListRefreshKey(prev => prev + 1); // Refresh the job list
      
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to post job: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job');
    }
  };

  const handleAdmitCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(admitCardFormData),
      });

      if (response.ok) {
        alert('Admit card posted successfully!');
        setAdmitCardFormData({
          title: '',
          description: '',
          organization: '',
          location: '',
          subtitle: '',
          applicationDeadline: '',
          category: '',
          downloadAdmitcardLink: '',
        });
      } else {
        alert('Failed to post admit card');
      }
    } catch (error) {
      console.error('Error posting admit card:', error);
      alert('Error posting admit card');
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newsFormData.title);
      formData.append('content', newsFormData.content);
      formData.append('organization', newsFormData.organization);
      formData.append('category', newsFormData.category);
      formData.append('status', newsFormData.status);
      formData.append('publishDate', newsFormData.publishDate);
      if (newsFormData.image && newsFormData.image instanceof File) {
        console.log('Appending image to FormData:', newsFormData.image);
        formData.append('image', newsFormData.image);
      } else {
        console.log('No image selected or image is not a File:', newsFormData.image);
      }

      const response = await fetch('/api/news', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('News posted successfully!');
        setNewsFormData({
          title: '',
          content: '',
          organization: '',
          category: '',
          status: 'published',
          publishDate: new Date().toISOString().split('T')[0],
          image: undefined,
          imagePreview: undefined,
        });
        setImagePreview(null);
      } else {
        alert('Failed to post news');
      }
    } catch (error) {
      console.error('Error posting news:', error);
      alert('Error posting news');
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultsFormData),
      });

      if (response.ok) {
        alert('Results posted successfully!');
        setResultsFormData({
          title: '',
          organization: '',
          resultDate: '',
          category: '',
          downloadLink: '',
          description: '',
          status: 'draft'
        });
      } else {
        alert('Failed to post results');
      }
    } catch (error) {
      console.error('Error posting results:', error);
      alert('Error posting results');
    }
  };

  const handleAnswerKeyFormSuccess = () => {
    setAnswerKeyListRefreshKey(prev => prev + 1); // Trigger list refresh
    // The form itself now handles resetting its state on successful creation via its own internal logic triggered by onSubmit completing without initialData
  };

  // This function will be passed as the onSubmit prop to AnswerKeyForm for creating new entries
  const handleCreateAnswerKey = async (data: any) => { // 'data' comes from AnswerKeyForm
    try {
      const response = await fetch('/api/answer-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Use data from the form
      });

      if (response.ok) {
        alert('Answer key posted successfully!');
        // No need to reset answerKeyFormData here, AnswerKeyForm handles its own state reset on success for create mode
        // onSuccess (handleAnswerKeyFormSuccess) will be called by AnswerKeyForm to refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to post answer key: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error posting answer key:', error);
      alert('Error posting answer key');
    }
  };

  const handleAdmissionSubmit = async (data: AdmissionFormDataType) => {
    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Admission posted successfully!');
        setAdmissionFormData({
          title: '',
          organization: '',
          applicationDeadline: '', // Corrected from admissionDate
          category: '',
          description: '',
          content: '', // Added content field
          applicationLink: '',
          status: 'published'
        });
      } else {
        alert('Failed to post admission');
      }
    } catch (error) {
      console.error('Error posting admission:', error);
      alert('Error posting admission');
    }
  };

  const tabs = [
    { id: 'jobs' as TabType, label: 'Jobs' },
    { id: 'results' as TabType, label: 'Results' },
    { id: 'admit-cards' as TabType, label: 'Admit Cards' },
    { id: 'news' as TabType, label: 'News' },
    { id: 'answer-keys' as TabType, label: 'Answer Keys' },
    { id: 'admissions' as TabType, label: 'Admissions' },
    { id: 'quizzes' as TabType, label: 'Quizzes' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'jobs' && (
        <>
          {/* The duplicated form content from approximately line 411 to 574 is replaced by the following: */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Post New Job</h2>
              <JobForm
                onSubmit={handleCreateJobSubmit} // Assumes handleCreateJobSubmit is defined in AdminPage
                onCancel={() => {
                  console.log("New job form cancelled.");
                
                }}
              
              />
            </div>
            <JobList key={jobListRefreshKey} /> 
          </div>
        </>
      )}

      {activeTab === 'results' && (
       <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white  rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Post New Results</h2>
           <form onSubmit={handleResultSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-medium mb-2">Exam Name</label>
               <input
                 type="text"
                 value={resultsFormData.title}
                 onChange={(e) => setResultsFormData({...resultsFormData,title: e.target.value})}
                 className="w-full p-2 border rounded-md"
                 required
                 minLength={3}
               />
             </div>
              

             <div>
               <label className="block text-sm font-medium mb-2">Organization</label>
               <input
                 type="text"
                 value={resultsFormData.organization}
                 onChange={(e) => setResultsFormData({...resultsFormData, organization: e.target.value})}
                 className="w-full p-2 border rounded-md"
                 required
               />
             </div>
             <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={resultsFormData.description}
                    onChange={(e) => setResultsFormData({...resultsFormData,description: e.target.value})}
                    className="w-full p-2 border rounded-md h-32"
                    required
                  />
                </div>

             <div>
               <label className="block text-sm font-medium mb-2">Result Date</label>
               <input
                 type="date"
                 value={resultsFormData.resultDate}
                 onChange={(e) => setResultsFormData({...resultsFormData, resultDate: e.target.value})}
                 className="w-full p-2 border rounded-md"
                 required
                 max={new Date().toISOString().split('T')[0]}
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-2">Category</label>
               <select
                 value={resultsFormData.category}
                 onChange={(e) => setResultsFormData({...resultsFormData, category: e.target.value})}
                 className="w-full p-2 border rounded-md"
                
               >
                 <option value="">Select a category</option>
                 <option value="government">Government</option>
                 <option value="private">Private</option>
                 <option value="education">Education</option>
                 <option value="other">Other</option>
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium mb-2">Download Link</label>
               <input
                 type="url"
                 value={resultsFormData.downloadLink}
                 onChange={(e) => setResultsFormData({...resultsFormData, downloadLink: e.target.value})}
                 className="w-full p-2 border rounded-md"
                 required
                 pattern="https?:\/\/(www\.)?[\w\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$"
               />
             </div>

             <Button type="submit" className="w-full">Post Result</Button>
           </form>
         </div>
         <ResultList />
       </div>
     </>
      )}

      {activeTab === 'news' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Post News</h2>
              <form onSubmit={handleNewsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newsFormData.title}
                    onChange={(e) => setNewsFormData({...newsFormData, title: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input
                    type="text"
                    value={newsFormData.organization}
                    onChange={(e) => setNewsFormData({...newsFormData, organization: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={newsFormData.content}
                    onChange={(e) => setNewsFormData({...newsFormData, content: e.target.value})}
                    className="w-full p-2 border rounded-md h-32"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newsFormData.category}
                    onChange={(e) => setNewsFormData({...newsFormData, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Publish Date</label>
                  <input
                    type="date"
                    value={newsFormData.publishDate}
                    onChange={(e) => setNewsFormData({...newsFormData, publishDate: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newsFormData.status}
                    onChange={(e) => setNewsFormData({...newsFormData, status: e.target.value})}
                    required
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewsFormData({ ...newsFormData, image: file });
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="max-h-40 rounded border" />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">Post News</Button>
              </form>
            </div>
            <NewsList />
          </div>
        </>
      )}

      {activeTab === 'admit-cards' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Post New Admit Card</h2>
              <form onSubmit={handleAdmitCardSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={admitCardFormData.title}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, title: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input
                    type="text"
                    value={admitCardFormData.organization}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, organization: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={admitCardFormData.description}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, description: e.target.value})}
                    className="w-full p-2 border rounded-md h-32"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Download Link</label>
                  <input
                    type="text"
                    value={admitCardFormData.downloadAdmitcardLink}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, downloadAdmitcardLink: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={admitCardFormData.location}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, location: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={admitCardFormData.subtitle}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, subtitle: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={admitCardFormData.category}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, category: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={admitCardFormData.applicationDeadline}
                    onChange={(e) => setAdmitCardFormData({...admitCardFormData, applicationDeadline: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">Post Admit Card</Button>
              </form>
            </div>
            <AdmitCard />
          </div>
        </>
      )}
      {activeTab === 'answer-keys' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              
              <AnswerKeyForm 
                onSubmit={handleCreateAnswerKey} 
                onSuccess={handleAnswerKeyFormSuccess} 
              />
            </div>
            <AnswerKeyList key={answerKeyListRefreshKey} /> {/* Refresh key ensures list updates */}
          </div>
        </>
      )}
      {activeTab === 'admissions' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Post New Admission</h2>
             
              <AdmissionForm 
                onSubmit={handleAdmissionSubmit} 
                initialData={admissionFormData}
                onCancel={() => { 
                  setAdmissionFormData({
                    title: '',
                    organization: '',
                    applicationDeadline: '',
                    category: '',
                    description: '',
                    content: '',
                    applicationLink: '',
                    status: 'published'
                  });
                }}
              />
            </div>
            <AdmissionList key={admissionListRefreshKey} />
          </div>
        </>
      )}
      {activeTab === 'quizzes' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Create New Quiz</h2>
              <QuizForm />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Quiz List</h2>
              <QuizList />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

