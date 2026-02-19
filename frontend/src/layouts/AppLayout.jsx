import { Outlet } from 'react-router-dom';
import GlassNavbar from '../components/GlassNavbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
