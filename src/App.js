import './App.css';
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useEffect, useState } from 'react'; // Import useEffect and useState
import { supabase } from './supabaseClient'; // Import supabase
import HowItWorks from './HowItWorks';
import About from './About'; // Import the new About component
import LoginPage from './LoginPage'; // Import LoginPage
import SignupPage from './SignupPage'; // Import SignupPage
import DashboardPage from './DashboardPage'; // Import DashboardPage

// Component for the landing page's main content
function HomeContent() {
  return (
    <main className="hero-section">
      <div className="hero-content">
        <h1>Level Up Your Skills, Boost Your Rank!</h1>
        <p className="secondary-text">Task-based mentorship for college students to learn, earn points, and climb the leaderboard.</p>
        <Link to="/login" className="cta-button">Join the Challenge</Link>
      </div>

      {/* Floating UI Cards - Reflecting the platform's core loop */}
      <div className="ui-card card-task">
        <p>Learn new skills: "Web Dev Basics"</p>
        <div className="progress-bar">
          <div className="progress" style={{ width: '85%' }}></div>
        </div>
      </div>

      <div className="ui-card card-sticky-note">
        <p>Get personalized feedback from seniors!</p>
      </div>

      <div className="ui-card card-reminder">
        <span className="icon">🏆</span>
        <p>Your Rank: #15</p>
        <span>+200 Points this week!</span>
      </div>

      <div className="ui-card card-integration">
        <div className="app-icons">
          <span>📚</span> <span>✅</span> <span>✨</span>
        </div>
        <p>Your Journey: Learn > Quiz > Task > Rank</p>
      </div>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(null); // State to hold session info
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []); // Removed navigate from dependency array

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="logo">MentorFlow</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/how-it-works">How it Works</Link>
          <Link to="/about">About</Link> {/* Changed to Link */}
          {!session ? ( // Conditionally render Login/Signup if no session
            <>
              <Link to="/login">Login</Link> {/* Updated to Link */}
            </>
          ) : (
            // You can add a link to a profile page or a logout button here
            // For now, let's just show nothing if logged in for these spots
            null
          )}
        </div>
        {!session && ( // Conditionally render Sign Up Free if no session
          <Link to="/signup" className="nav-cta">Sign Up Free</Link>
        )}
        {session && ( // Conditionally render a logout button if session exists
          <button
            className="nav-cta"
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error signing out:', error.message);
              } else {
                navigate('/'); // Redirect to home on successful logout
              }
            }}
          >
            Logout
          </button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<HomeContent />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} /> {/* Added new Route */}
        <Route path="/login" element={<LoginPage />} /> {/* Added LoginPage Route */}
        <Route path="/signup" element={<SignupPage />} /> {/* Added SignupPage Route */}
        <Route path="/dashboard" element={<DashboardPage />} /> {/* Added DashboardPage Route */}
      </Routes>
    </div>
  );
}

export default App;