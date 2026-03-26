import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Quick placeholder pages until we implement them
const Login = () => <div className="p-8">Login Page</div>;
const Register = () => <div className="p-8">Register Page</div>;
const Dashboard = () => <div className="p-8">Dashboard Page</div>;
const MonitorDetails = () => <div className="p-8">Monitor Details Page</div>;
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <header className="p-4 bg-white border-b border-slate-200 font-bold text-xl text-primary-600">
      API Pulse
    </header>
    <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
      {children}
    </main>
  </div>
);

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  // Simple PrivateRoute wrapper
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/monitors/:id" element={<MonitorDetails />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
