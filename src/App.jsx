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

  useEffect(() => {
    import('./api').then(({ settingsApi }) => {
      settingsApi.getPublic().then(s => {
        if (s?.app_favicon) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = s.app_favicon;
        }
      }).catch(() => {});
    });
  }, []);

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
