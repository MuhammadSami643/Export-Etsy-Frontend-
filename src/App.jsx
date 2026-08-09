import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setGlobalNavigate } from './api/client';
import useTracker from './hooks/useTracker';
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes';
import ScrollToTop from './components/ScrollToTop';

import { AuthProvider } from './context/AuthContext';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);

  useTracker();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AuthProvider key="admin"><AdminRoutes /></AuthProvider>} />
        <Route path="/*" element={<AuthProvider key="user"><UserRoutes /></AuthProvider>} />
      </Routes>
    </>
  );
}

export default App;
