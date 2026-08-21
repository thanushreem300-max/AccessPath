import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { Eye, Type } from 'lucide-react';

import Welcome from './pages/Welcome';
import HowItWorks from './pages/HowItWorks';
import ProfileSelection from './pages/ProfileSelection';
import Destination from './pages/Destination';
import Planner from './pages/Planner';

function App() {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('a11y-high-contrast') === 'true';
  });

  const [largeText, setLargeText] = useState<boolean>(() => {
    return localStorage.getItem('a11y-large-text') === 'true';
  });

  const [selectedProfile, setSelectedProfile] = useState<string>(() => {
    return localStorage.getItem('selected-profile') || '';
  });

  const [selectedProfileName, setSelectedProfileName] = useState<string>(() => {
    return localStorage.getItem('selected-profile-name') || 'None Selected';
  });

  // Keep body classes in sync with user settings
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('a11y-high-contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    if (largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    localStorage.setItem('a11y-large-text', String(largeText));
  }, [largeText]);

  const selectProfile = (id: string, name: string) => {
    setSelectedProfile(id);
    setSelectedProfileName(name);
    localStorage.setItem('selected-profile', id);
    localStorage.setItem('selected-profile-name', name);
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleLargeText = () => setLargeText(!largeText);

  return (
    <Router>
      <div className="app-container">
        {/* Main Header */}
        <header className="header" role="banner">
          <Link to="/" className="logo-section" aria-label="AccessPath home">
            <span className="logo-text">Access<span className="logo-sub">Path</span></span>
          </Link>

          <nav className="nav-links" role="navigation" aria-label="Main Navigation">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Welcome
            </NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              How It Works
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Profile Selection
            </NavLink>
            <NavLink to="/destination" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Pilot Destination
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Route Planner
            </NavLink>
          </nav>

          {/* Accessibility Settings in Header */}
          <div className="a11y-controls" role="group" aria-label="Accessibility Controls">
            <button 
              className={`a11y-btn ${highContrast ? 'active' : ''}`} 
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              title="Toggle High Contrast Mode"
            >
              <Eye size={18} aria-hidden="true" />
              <span>High Contrast</span>
            </button>
            <button 
              className={`a11y-btn ${largeText ? 'active' : ''}`} 
              onClick={toggleLargeText}
              aria-pressed={largeText}
              title="Toggle Larger Text size"
            >
              <Type size={18} aria-hidden="true" />
              <span>Large Text</span>
            </button>
          </div>
        </header>

        {/* Global Live Region for screen readers */}
        <div id="aria-live-announcer" className="sr-only" aria-live="polite"></div>

        {/* Dynamic Route Pages */}
        <main className="main-content" id="main-content" role="main">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route 
              path="/profile" 
              element={
                <ProfileSelection 
                  selectedProfile={selectedProfile} 
                  onSelectProfile={selectProfile} 
                />
              } 
            />
            <Route 
              path="/destination" 
              element={
                <Destination 
                  selectedProfile={selectedProfile}
                />
              } 
            />
            <Route 
              path="/planner" 
              element={
                <Planner 
                  selectedProfile={selectedProfile} 
                  selectedProfileName={selectedProfileName}
                  onSelectProfile={selectProfile}
                />
              } 
            />
          </Routes>
        </main>

        <footer className="footer" role="contentinfo">
          <p>© 2026 INNOVISION — Omnikon National Hackathon Phase 2 Prototype. Pilot site: Cubbon Park, Bengaluru.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Disclaimer: Pathway conditions and accessibility ratings are simulated sample data for demonstration only.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
