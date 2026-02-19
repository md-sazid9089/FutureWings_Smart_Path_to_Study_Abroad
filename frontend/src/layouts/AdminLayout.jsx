import { Outlet } from 'react-router-dom';
import GlassSidebar from '../components/GlassSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <GlassSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
