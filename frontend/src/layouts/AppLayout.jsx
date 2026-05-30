import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import GlassNavbar from '../components/GlassNavbar';
import { useAuth } from '../context/AuthContext';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { shouldShowProfilePrompt, markProfilePromptShown } from '../utils/profileCompletion';


export default function AppLayout() {
  const { user, syncPremiumStatus } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && shouldShowProfilePrompt(user)) {
        setShowProfileModal(true);
        markProfilePromptShown();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    // Sync premium status on session start via AuthContext
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
      {showProfileModal && (
        <ProfileCompletionModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onComplete={() => {
            setShowProfileModal(false);
            navigate('/profile');
          }}
        />
      )}
    </div>
  );
}
