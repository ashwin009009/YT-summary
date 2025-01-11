import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Youtube, LogOut, History } from 'lucide-react';

interface Summary {
  title: string;
  summary: string;
  timestamp: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Summary[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://n8n-dev.subspace.money/webhook/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_url: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      console.log("Summary Response:", data);

      // Update the current summary and history
      const newSummary: Summary = {
        title: data.title || 'Untitled Video', // Assuming the API returns a title
        summary: data.summary,
        timestamp: new Date().toISOString(),
      };

      setCurrentSummary(newSummary);
      setHistory((prev) => [newSummary, ...prev]);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Youtube className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800">
                VideoSummarizer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Rest of the Dashboard component remains the same */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Generating Summary...' : 'Generate Summary'}
            </button>
          </form>
        </div>

        {currentSummary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentSummary.title}
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
              {currentSummary.summary}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Generated on: {new Date(currentSummary.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* {history.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <History className="h-5 w-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800 ml-2">
                Previous Summaries
              </h3>
            </div>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                >
                  <h4 className="font-medium text-gray-800">{item.title}</h4>
                  <p className="text-gray-600 mt-2">{item.summary}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </main>
    </div>
  );
}