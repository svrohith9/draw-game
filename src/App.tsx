import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Auth from './pages/Auth';
import Sessions from './pages/Sessions';
import Chat from './pages/Chat';

function App() {
  const { initialize, loading, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/sessions" /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={user ? <Navigate to="/sessions" /> : <Auth />}
        />
        <Route
          path="/sessions"
          element={user ? <Sessions /> : <Navigate to="/auth" />}
        />
        <Route
          path="/chat/:sessionId"
          element={user ? <Chat /> : <Navigate to="/auth" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;