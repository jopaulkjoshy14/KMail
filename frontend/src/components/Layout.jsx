import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

const Layout = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-200 dark:bg-gray-800 p-4 space-y-3">
        <nav className="flex flex-col space-y-2">
          <Link to="/inbox">Inbox</Link>
          <Link to="/sent">Sent</Link>
          <Link to="/drafts">Drafts</Link>
          <Link to="/trash">Trash</Link>
          <Link to="/compose">Compose</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={logout}>Logout</button>
          <button onClick={toggleTheme}>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</button>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;
