import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaskList from './pages/TaskList';
import ExerciseCard from './pages/ExerciseCard';
import ManageContent from './pages/ManageContent';
import Profile from './pages/Profile';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Защищенные маршруты */}
        <Route path="/" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        <Route path="/exercise/:id" element={
          <ProtectedRoute>
            <ExerciseCard />
          </ProtectedRoute>
        } />
        <Route path="/manage" element={
          <ProtectedRoute>
            <ManageContent />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

export default App; 