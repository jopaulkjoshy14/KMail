import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Inbox from './pages/Inbox.jsx';
import Compose from './pages/Compose.jsx';
import Profile from './pages/Profile.jsx';
import { useAuth } from './hooks/useAuth.js';
import Layout from './components/Layout.jsx';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/inbox" />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;
