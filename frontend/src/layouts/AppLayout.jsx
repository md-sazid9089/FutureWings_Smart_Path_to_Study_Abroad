
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import GlassNavbar from '../components/GlassNavbar';
import { syncPremiumStatus } from '../utils/syncPremiumStatus';


export default function AppLayout() {
  useEffect(() => {
    // Sync premium status on session start
    syncPremiumStatus();
    // Sync on tab storage event
    const handleStorage = (event) => {
      if (event.key === 'isPremium' || event.key === 'premiumExpiryDate' || event.key === 'user') {
        syncPremiumStatus();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
