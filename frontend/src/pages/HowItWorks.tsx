import { Link } from 'react-router-dom';
import { ArrowRight, UserCheck, Search, Route, AlertCircle, ShieldAlert } from 'lucide-react';

function HowItWorks() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem', textAlign: 'center' }}>
        How AccessPath Works
      </h1>
      
      <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
        AccessPath evaluates pathway characteristics against your physical requirements to calculate custom, explainable routes.
      </p>

      {/* The 4 steps workflow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', margin: '3rem 0' }}>
        
        {/* Step 1 */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ 
            backgroundColor: 'var(--color-accent)', 
            color: 'white', 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            1
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <UserCheck size={20} color="var(--color-accent)" />
              Choose Your Accessibility Profile
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Select a profile (such as Wheelchair, Low Vision, Hearing Support, Elderly, or Temporary Injury) that reflects your navigational limitations. The routing engine adjusts weights for steps, slope angles, width, and lighting depending on this selection.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ 
            backgroundColor: 'var(--color-accent)', 
            color: 'white', 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            2
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <Search size={20} color="var(--color-accent)" />
              Select Destination
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Choose from active pilot locations. AccessPath fetches the latest surveyed map nodes and segments, loaded with physical parameters such as width, gradient, stair counts, and surface texture.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ 
            backgroundColor: 'var(--color-accent)', 
            color: 'white', 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            3
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <Route size={20} color="var(--color-accent)" />
              Compare Routes & Inspect Explanations
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Review recommended, caution-required, and rejected routes side-by-side. AccessPath clearly writes out plain-English explanations: "Rejected: contains a flight of 12 granite stairs."
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ 
            backgroundColor: 'var(--color-accent)', 
            color: 'white', 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0
          }}>
            4
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <AlertCircle size={20} color="var(--color-accent)" />
              Navigate and Report Barriers
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Activate screen-reader or visual step-by-step guidance. If you encounter a blocked ramp, narrow construction, or broken lift, submit a report to instantly update the map and recalculate an alternative route.
            </p>
          </div>
        </div>

      </div>

      {/* The Shortest != Best explanation */}
      <div style={{ 
        backgroundColor: 'var(--color-warning-light)', 
        border: '1px solid var(--color-warning)', 
        borderRadius: '0.75rem', 
        padding: '1.5rem',
        margin: '2rem 0'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={20} color="var(--color-warning)" />
          Shortest Route != Best Route
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Commercial navigation apps always aim to minimize distance. However, for a wheelchair traveler:
          <br /><br />
          • A <strong>220m route (Route A)</strong> containing a flight of stairs is effectively <strong>unusable (0% accessible)</strong>.
          <br />
          • A <strong>300m route (Route B)</strong> containing a gentle ramp and smooth asphalt is <strong>100% accessible</strong>.
          <br /><br />
          AccessPath prioritizes accessibility. It filters out hard violations first, then optimizes for distance and comfort, providing clear reasons for rejecting the shorter route.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/profile" className="btn btn-primary">
          Select Your Profile to Start
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default HowItWorks;
