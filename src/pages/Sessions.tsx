import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Plus } from 'lucide-react';

export default function Sessions() {
  const navigate = useNavigate();
  const { sessions, loading, fetchSessions, createSession } = useSessionStore();
  const { user, signOut } = useAuthStore();
  const [newSessionName, setNewSessionName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createSession(newSessionName);
      setNewSessionName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleJoinSession = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Chat Sessions</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleCreateSession} className="flex gap-4">
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Enter session name"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Session
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleJoinSession(session.id)}
              >
                <h3 className="text-lg font-medium text-gray-900">{session.name}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Created {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}