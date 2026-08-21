import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Accessibility, Eye, Ear, UserCheck, Activity, ArrowRight, ShieldAlert } from 'lucide-react';

interface ProfileSelectionProps {
  selectedProfile: string;
  onSelectProfile: (id: string, name: string) => void;
}

const PROFILES = [
  {
    id: 'wheelchair',
    name: 'Wheelchair Mode',
    icon: Accessibility,
    description: 'Avoids steps and steep slopes. Prefers wide concrete/asphalt paths with ramps.',
    rules: 'Rejects stairs. Rejects paths width < 1.2m. Penalizes slopes > 5%.'
  },
  {
    id: 'low_vision',
    name: 'Low Vision Mode',
    icon: Eye,
    description: 'Prefers well-lit paths and simple intersections. Prioritizes voice guidance instructions.',
    rules: 'Penalizes low lighting. Avoids complex routes. Enforces spoken navigation warnings.'
  },
  {
    id: 'hearing',
    name: 'Hearing Support Mode',
    icon: Ear,
    description: 'Focuses on strong visual direction markers and distinct visual alerts for warnings.',
    rules: 'Enhances high-contrast screen prompts. Enables caption fallback indicators.'
  },
  {
    id: 'elderly',
    name: 'Elderly Support Mode',
    icon: UserCheck,
    description: 'Avoids steep inclines and long walks. Prefers flat surfaces with nearby resting points.',
    rules: 'Limits stairs to < 5 steps. Discourages steep slopes. Slows down walking-time estimates.'
  },
  {
    id: 'temporary_injury',
    name: 'Temporary Injury Mode',
    icon: Activity,
    description: 'Designed for crutches or walking sticks. Rejects steps and steep slope transitions.',
    rules: 'Rejects stairs. Avoids paths with uneven paved surfaces or high slope angles.'
  }
];

function ProfileSelection({ selectedProfile, onSelectProfile }: ProfileSelectionProps) {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const navigate = useNavigate();

  const handleSelect = (id: string, name: string) => {
    onSelectMsg(`Selected profile: ${name}`);
    onSelectProfile(id, name);
    setErrorMsg('');
  };

  const onSelectMsg = (msg: string) => {
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.innerText = msg;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, name: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleSelect(id, name);
    }
  };

  const handleContinue = () => {
    if (!selectedProfile) {
      setErrorMsg('Please select an accessibility profile to continue.');
      onSelectMsg('Error: Please select an accessibility profile to continue.');
      return;
    }
    navigate('/destination');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
        Select Accessibility Profile
      </h1>
      <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2.5rem' }}>
        Choose a profile below to customize the route calculations to your specific requirements.
      </p>

      {/* Validation message */}
      {errorMsg && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          backgroundColor: 'var(--color-error-light)', 
          border: '1px solid var(--color-error)', 
          color: 'var(--color-text)', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          fontWeight: 600
        }} role="alert">
          <ShieldAlert size={20} color="var(--color-error)" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of Profile Cards */}
      <div 
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}
        role="radiogroup"
        aria-label="Select an accessibility profile"
      >
        {PROFILES.map((profile) => {
          const IconComp = profile.icon;
          const isSelected = selectedProfile === profile.id;
          
          return (
            <div
              key={profile.id}
              className={`card profile-card ${isSelected ? 'selected' : ''}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(profile.id, profile.name)}
              onKeyDown={(e) => handleKeyDown(e, profile.id, profile.name)}
              aria-label={profile.name}
            >
              <div 
                className="card-icon"
                style={{
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-accent-light)',
                  color: isSelected ? 'white' : 'var(--color-accent)'
                }}
              >
                <IconComp size={24} aria-hidden="true" />
              </div>
              <h2 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {profile.name}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem', flex: 1 }}>
                {profile.description}
              </p>
              <div style={{ 
                borderTop: '1px solid var(--color-border)', 
                paddingTop: '0.75rem', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)'
              }}>
                <strong>Rules:</strong> {profile.rules}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {selectedProfile ? (
            <span>Selected: <strong>{PROFILES.find(p => p.id === selectedProfile)?.name}</strong></span>
          ) : (
            <span>No profile selected yet.</span>
          )}
        </div>
        <button 
          onClick={handleContinue} 
          className="btn btn-primary"
          aria-label="Continue to Destination Selection"
        >
          Continue
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default ProfileSelection;
