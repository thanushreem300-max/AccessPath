import { Link } from 'react-router-dom';
import { Compass, Accessibility, AlertTriangle, Play, HelpCircle, Layers } from 'lucide-react';

function Welcome() {
  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '1.5rem' }}>
          <Accessibility size={48} aria-hidden="true" />
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Access<span style={{ color: 'var(--color-accent)' }}>Path</span>
          </span>
        </div>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: 'var(--color-primary)' }}>
          Every route should include everyone.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          AccessPath is a dynamic accessibility routing system that does not simply label a destination as accessible or inaccessible. It recommends, updates, and explains routes based on individual accessibility requirements and recently reported pathway barriers.
        </p>

        {/* Prototype Alert */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          backgroundColor: 'var(--color-warning-light)', 
          border: '1px solid var(--color-warning)', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--color-primary)',
          marginBottom: '2rem'
        }}>
          <AlertTriangle size={16} color="var(--color-warning)" aria-hidden="true" />
          <span>Omnikon Hackathon 2026: Phase 2 Prototype using sample data</span>
        </div>

        {/* Call to Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/profile" className="btn btn-primary" aria-label="Start planning an accessible route">
            <Play size={18} aria-hidden="true" />
            Plan an Accessible Route
          </Link>
          <Link to="/how-it-works" className="btn btn-secondary" aria-label="Learn how AccessPath works">
            <HelpCircle size={18} aria-hidden="true" />
            How AccessPath Works
          </Link>
        </div>
      </div>

      {/* Value Cards */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginTop: '2rem' }}>Core Value Propositions</h2>
      <div className="card-grid">
        <div className="card">
          <div className="card-icon">
            <Accessibility size={24} aria-hidden="true" />
          </div>
          <h3 className="card-title">Profile-Based Routing</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Select specialized requirements for wheelchairs, low vision, hearing, elderly support, or temporary injury to generate tailored route computations.
          </p>
        </div>

        <div className="card">
          <div className="card-icon">
            <Layers size={24} aria-hidden="true" />
          </div>
          <h3 className="card-title">Explainable Decisions</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Receive plain-language explanations of route choices, showing exactly why a route was accepted, recommended, or rejected.
          </p>
        </div>

        <div className="card">
          <div className="card-icon">
            <AlertTriangle size={24} aria-hidden="true" />
          </div>
          <h3 className="card-title">Live Barrier Reports</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Submit and view crowdsourced barrier updates (e.g. blocked ramps, construction, step damage) which trigger instant automatic rerouting.
          </p>
        </div>

        <div className="card">
          <div className="card-icon">
            <Compass size={24} aria-hidden="true" />
          </div>
          <h3 className="card-title">Multi-Modal Guidance</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Navigate with high-contrast text directions, visual progress alerts, and screen-reader spoken guidance instructions.
          </p>
        </div>
      </div>

      {/* Demo Flow Preview */}
      <div className="demo-preview-box">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={20} color="var(--color-accent)" aria-hidden="true" />
          Omnikon Judge Demo Flow Walkthrough
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
          The complete flow has been prepared for hackathon judges to verify AccessPath's capabilities:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#1E293B', padding: '1rem', borderRadius: '0.5rem' }}>
            <span className="demo-step-badge">Step 1-3</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Choose <strong>Wheelchair Mode</strong>, select <strong>Cubbon Park</strong>, and load the path alternatives.
            </p>
          </div>
          <div style={{ backgroundColor: '#1E293B', padding: '1rem', borderRadius: '0.5rem' }}>
            <span className="demo-step-badge">Step 4-7</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Compare routes: <strong>Route A (stairs)</strong> is rejected; <strong>Route B (ramp)</strong> is recommended. Start step guidance.
            </p>
          </div>
          <div style={{ backgroundColor: '#1E293B', padding: '1rem', borderRadius: '0.5rem' }}>
            <span className="demo-step-badge">Step 8-10</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Report Route B's ramp as <strong>Blocked</strong>. Watch the route automatically calculate <strong>Route C</strong> with updated guidance!
            </p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/profile" className="btn btn-primary" style={{ backgroundColor: '#ffffff', color: 'var(--color-primary)' }}>
            Start the Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
