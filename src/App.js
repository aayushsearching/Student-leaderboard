import './App.css';
import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { supabase } from './supabaseClient';
import HowItWorks from './HowItWorks';
import About from './About';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import TasksPage from './TasksPage';
import DashboardOverview from './DashboardOverview';
import BadgeRankingPage from './BadgeRankingPage';
import ProfilePage from './ProfilePage';
import AdminPage from './AdminPage';
import AdminLayout from './AdminLayout';
import PointSystemPage from './PointSystemPage';
import ProtectedRoute from './ProtectedRoute';
import NotificationsPage from './NotificationsPage'; // Import NotificationsPage
import CompleteProfilePage from './CompleteProfilePage'; // Import CompleteProfilePage

function HomeContent() {
  return (
    <main className="hero-section">
      <div className="hero-content">
        <h1>Level Up Your Skills, Boost Your Rank!</h1>
        <p className="secondary-text">Task-based mentorship for college students to learn, earn points, and climb the leaderboard.</p>
        <Link to="/login" className="cta-button">Join the Challenge</Link>
      </div>
    </main>
  );
}

function MainLayout({ session, onLogout, user, profile }) { // Add profile prop
  // Removed notification state and logic from here
  return (
    <>
      <nav className="main-nav">
        <div className="logo">MentorFlow</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/how-it-works">How it Works</Link>
          <Link to="/about">About</Link>
          {session && <Link to="/dashboard">Dashboard</Link>}
          {/* Removed notification link */}
          {!session && <Link to="/login">Login</Link>}
        </div>
        {!session ? (
          <Link to="/signup" className="nav-cta">Sign Up Free</Link>
        ) : (
          <button className="nav-cta" onClick={onLogout}>Logout</button>
        )}
      </nav>
      <Outlet />
    </>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(null); // null, true, or false
  const [profile, setProfile] = useState(null); // Store user profile
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation

  useEffect(() => {
    // Redirect logic
    if (!loading && session && profileComplete === false && location.pathname !== '/complete-profile') {
      navigate('/complete-profile');
    } else if (!loading && session && profileComplete === true && location.pathname === '/complete-profile') {
      navigate('/dashboard'); // If profile is complete and user is on complete-profile page, redirect to dashboard
    }
  }, [loading, session, profileComplete, location.pathname, navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, academic_year, branch, role')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
          console.error('Error fetching profile:', profileError);
          setProfileComplete(false); // Assume incomplete on error
        } else if (profileData) {
          setProfile(profileData);
          const isComplete = profileData.full_name && profileData.academic_year && profileData.branch;
          setProfileComplete(!!isComplete); // Convert to boolean
        } else {
          // No profile found, so it's incomplete
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(true); // No user, so no profile to complete or it's implicitly complete
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // When auth state changes, re-evaluate profile completeness
        if (session?.user) {
          supabase
            .from('profiles')
            .select('full_name, academic_year, branch, role')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profileData, error: profileError }) => {
              if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile on auth state change:', profileError);
                setProfileComplete(false);
              } else if (profileData) {
                setProfile(profileData);
                const isComplete = profileData.full_name && profileData.academic_year && profileData.branch;
                setProfileComplete(!!isComplete);
              } else {
                setProfileComplete(false);
              }
            });
        } else {
          setProfileComplete(true); // No user, implicitly complete
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    else navigate('/');
  }, [navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainLayout session={session} onLogout={handleLogout} user={session?.user} profile={profile} />}>
          <Route index element={<HomeContent />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="dashboard" element={<DashboardPage user={session?.user} />}>
            <Route index element={<DashboardOverview user={session?.user} />} />
            <Route path="tasks" element={<TasksPage user={session?.user} />} />
            <Route path="leaderboard" element={<BadgeRankingPage user={session?.user} />} />
            <Route path="notifications" element={<NotificationsPage user={session?.user} />} /> {/* New route */}
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