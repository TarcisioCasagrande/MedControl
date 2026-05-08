import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100">
      <Sidebar />

      <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;