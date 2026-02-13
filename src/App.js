import './App.css';
import { Routes, Route, Link, useNavigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
import NotificationsPage from './NotificationsPage';
import CompleteProfilePage from './CompleteProfilePage';
import { CheckSquare, GitMerge, Send, Users, Info, HelpCircle, LogIn, UserPlus, Grid, LogOut } from 'react-feather';

function HomeContent() {
  return (
    <main className="hero-section">
      <div className="hero-content">
        <h1>Level Up Your Skills, Boost Your Rank!</h1>
        <p className="secondary-text">Task-based mentorship for college students to learn, earn points, and climb the leaderboard.</p>
        <Link to="/login" className="cta-button">Join the Challenge</Link>
      </div>

      {/* Floating UI Cards */}
      <div className="ui-card card-task">
        <div className="card-header">
          <span className="card-title">Submit Task</span>
          <CheckSquare className="card-icon" size={20} />
        </div>
        <div className="card-body">
          <p>Complete the assigned task and submit for peer review.</p>
        </div>
        <div className="card-footer">
          <div className="avatar-group">
            <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Avatar" className="avatar" />
            <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Avatar" className="avatar" />
          </div>
        </div>
      </div>

      <div className="ui-card card-sticky-note">
        <p className="sticky-note-text">"The only way to do great work is to love what you do."</p>
      </div>

      <div className="ui-card card-reminder">
        <div className="card-header">
          <span className="card-title">Weekly Sync</span>
          <Send className="card-icon" size={20} />
        </div>
        <div className="reminder-item">
          <div className="reminder-checkbox"></div>
          <span className="reminder-text">Sync up with the team on project progress.</span>
        </div>
      </div>

      <div className="ui-card card-integration">
        <div className="card-header">
          <span className="card-title">Connect</span>
        </div>
        <div className="integration-icons">
          <GitMerge className="card-icon" size={24} />
          <Users className="card-icon" size={24} />
        </div>
      </div>
    </main>
  );
}

function MainLayout({ session, onLogout }) {
  const location = useLocation();

  const getActiveClass = ({ isActive }) => isActive ? 'nav-item active' : 'nav-item';

  return (
    <>
      <div className="main-nav-container">
        <nav className="main-nav">
          <NavLink to="/" className="logo-link nav-item">
            <div className="logo">MentorFlow</div>
          </NavLink>
          <NavLink to="/how-it-works" className={getActiveClass}>
            <HelpCircle className="nav-icon" />
            <span className="nav-label">How it Works</span>
          </NavLink>
          
          {session ? (
            <NavLink to="/dashboard" className="nav-primary-action">
              <Grid />
            </NavLink>
          ) : (
            <NavLink to="/login" className="nav-primary-action">
              <LogIn />
            </NavLink>
          )}

          <NavLink to="/about" className={getActiveClass}>
            <Info className="nav-icon" />
            <span className="nav-label">About</span>
          </NavLink>
          {session ? (
            <button onClick={onLogout} className="nav-item">
              <LogOut className="nav-icon" />
              <span className="nav-label">Logout</span>
            </button>
          ) : (
            <NavLink to="/signup" className={getActiveClass}>
              <UserPlus className="nav-icon" />
              <span className="nav-label">Sign Up</span>
            </NavLink>
          )}
        </nav>
      </div>
      <div className="container-1200">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session && profileComplete === false) { // Removed location.pathname condition
      navigate('/complete-profile');
    } else if (!loading && session && profileComplete === true) { // Removed location.pathname === '/complete-profile'
      navigate('/dashboard');
    }
  }, [loading, session, profileComplete, navigate]); // Removed location.pathname from dependencies

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, academic_year, branch, role')
          .eq('id', data.session.user.id)
          .maybeSingle(); // Changed to maybeSingle()

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfileComplete(false); // Profile is incomplete if there's an error
        } else if (profileData) {
          setProfile(profileData);
          // Check for completeness only if profileData exists
          const isComplete = profileData.full_name && profileData.academic_year && profileData.branch;
          setProfileComplete(!!isComplete);
        } else {
          // If profileData is null, profile is definitely incomplete
          setProfileComplete(false);
        }
      } else {
        // No user session, so no profile to complete.
        // This implicitly means the onboarding loop shouldn't apply,
        // so we can consider it "complete" for the purpose of not redirecting to onboarding.
        setProfileComplete(true);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          supabase
            .from('profiles')
            .select('full_name, academic_year, branch, role')
            .eq('id', session.user.id)
            .maybeSingle() // Changed to maybeSingle()
            .then(({ data: profileData, error: profileError }) => {
              if (profileError) {
                console.error('Error fetching profile on auth state change:', profileError);
                setProfileComplete(false); // Profile is incomplete if there's an error
              } else if (profileData) {
                setProfile(profileData);
                const isComplete = profileData.full_name && profileData.academic_year && profileData.branch;
                setProfileComplete(!!isComplete);
              } else {
                // If profileData is null, profile is definitely incomplete
                setProfileComplete(false);
              }
            });
        } else {
          setProfileComplete(true);
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