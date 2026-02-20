import { Outlet } from 'react-router-dom';
import GlassNavbar from '../components/GlassNavbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
