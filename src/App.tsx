import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Tasks } from './pages/Tasks';
import { Settings } from './pages/Settings';

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navigation
        user={user}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="pt-16">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'employees' && <Employees />}
        {currentPage === 'tasks' && <Tasks />}
        {currentPage === 'settings' && <Settings />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
