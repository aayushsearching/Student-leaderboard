import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import HowItWorks from './pages/HowItWorksPage';
import About from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TaskPage';
import DashboardOverview from './pages/DashboardOverviewPage';
import BadgeRankingPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AdminLayout from './pages/AdminLayoutPage';
import PointSystemPage from './pages/PointSystemPage';
import ProtectedRoute from './ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import HomeContent from './components/Home/HomeContent';
import MainLayout from './components/Layout/MainLayout';
import { getCurrentSession, signOut, subscribeToAuthStateChanges } from './services/authService';
import { fetchProfileById } from './services/profileService';
import { isProfileComplete } from './utils/helpers';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && profileComplete === false) {
      navigate('/complete-profile');
    }
  }, [loading, session, profileComplete, navigate]);

  const syncProfileState = useCallback(async (userId, logContext) => {
    const { data: profileData, error: profileError } = await fetchProfileById(userId);

    if (profileError) {
      console.error(`Error fetching profile${logContext}:`, profileError);
      setProfile(null);
      setProfileComplete(false);
      return;
    }

    if (profileData) {
      setProfile(profileData);
      setProfileComplete(isProfileComplete(profileData));
      return;
    }

    setProfile(null);
    setProfileComplete(false);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const fetchedSession = await getCurrentSession();
      setSession(fetchedSession);

      if (fetchedSession?.user) {
        await syncProfileState(fetchedSession.user.id, '');
      } else {
        setProfile(null);
        setProfileComplete(true);
      }
      setLoading(false);
    };

    initializeAuth();

    const authSubscription = subscribeToAuthStateChanges(
      (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          syncProfileState(nextSession.user.id, ' on auth state change');
        } else {
          setProfileComplete(true);
          setProfile(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [syncProfileState]);

  const handleLogout = useCallback(async () => {
    const { error } = await signOut();
    if (error) console.error('Error signing out:', error.message);
    else navigate('/');
  }, [navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainLayout session={session} onLogout={handleLogout} />}>
          <Route index element={<HomeContent />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="dashboard" element={<DashboardPage user={session?.user} />}>
            <Route index element={<DashboardOverview user={session?.user} />} />
            <Route path="tasks" element={<TasksPage user={session?.user} />} />
            <Route path="leaderboard" element={<BadgeRankingPage user={session?.user} />} />
            <Route path="notifications" element={<NotificationsPage user={session?.user} />} />
          </Route>
          <Route path="profile" element={<ProfilePage user={session?.user} />} />
          <Route path="/complete-profile" element={<CompleteProfilePage user={session?.user} profile={profile} profileComplete={profileComplete} />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={session?.user} appLoading={loading} profile={profile} profileComplete={profileComplete} requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPage user={session?.user} />} />
          <Route path="points" element={<PointSystemPage user={session?.user} />} />
          <Route path="leaderboard" element={<BadgeRankingPage user={session?.user} />} />
          <Route path="profile" element={<ProfilePage user={session?.user} />} />
        </Route>
      </Routes>
    </div>
  );
}
export default App;
