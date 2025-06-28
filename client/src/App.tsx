import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaskList from './pages/TaskList';
import ExerciseCard from './pages/ExerciseCard';
import ManageContent from './pages/ManageContent';
import Profile from './pages/Profile';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/exercise/:id" element={<ExerciseCard />} />
        <Route path="/manage" element={<ManageContent />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
};

export default App; 