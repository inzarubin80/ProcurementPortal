import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TaskList from './pages/TaskList';
import ExerciseCard from './pages/ExerciseCard';
import ManageContent from './pages/ManageContent';
import Profile from './pages/Profile';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const NoMatch: React.FC = () => {
  return (
    <div>
      <h2>Привет!!! это не наш путь</h2>
      <p>
        <Link to="/">Пойдем на главную страницу</Link>
      </p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Защищенные маршруты */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TaskList />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/exercise/:id" element={<ExerciseCard />} />
          <Route path="/manage" element={<ManageContent />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Обработка несуществующих маршрутов */}
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </>
  );
};

export default App; 