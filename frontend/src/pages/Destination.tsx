import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, AlertCircle, ArrowLeft, ArrowRight, ShieldAlert, BadgeInfo } from 'lucide-react';

interface DestinationProps {
  selectedProfile: string;
}

const DESTINATIONS = [
  {
    id: 'cubbon_park',
    name: 'Cubbon Park, Bengaluru',
    description: 'A historic 300-acre park located in the central administrative area of Bengaluru. It is a major lung space of the city with lush flora and pathways.',
    status: 'Active Pilot Site',
    badgeClass: 'badge-pilot',
    active: true,
    attributes: {
      pathways: 'Smooth asphalt, concrete walkways, paved stone tracks',
      ramps: 'Ramps available at the Bamboo Grove elevation changes',
      stairs: 'Flight of 12 granite stairs near the King Edward Statue entrance',
      width: 'Wide walkways (1.5m to 2.5m minimum clearances)',
      lighting: 'Main walkways well-lit; outer loop trails have dim lighting',
      barriers: 'Dynamic temporary obstructions (e.g. fallen branch, construction)'
    }
  },
  {
    id: 'lalbagh_gardens',
    name: 'Lalbagh Botanical Garden',
    description: 'Renowned botanical gardens dating back to the 18th century, home to a classical glass house, lake walkway, and thousands of trees.',
    status: 'Coming Later',
    badgeClass: 'badge-secondary',
    active: false,
    attributes: {}
  },
  {
    id: 'bangalore_palace',
    name: 'Bangalore Palace',
    description: 'A grand royal palace showcasing mock-Tudor architecture, wooden carvings, turrets, and historical exhibitions.',
    status: 'Coming Later',
    badgeClass: 'badge-secondary',
    active: false,
    attributes: {}
  }
];

function Destination({ selectedProfile }: DestinationProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDestId, setSelectedDestId] = useState<string>('cubbon_park');
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/planner');
  };

  const filteredDestinations = DESTINATIONS.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Selection warning if profile is missing */}
      {!selectedProfile && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-warning-light)', 
          border: '1px solid var(--color-warning)', 
          color: 'var(--color-text)', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="var(--color-warning)" aria-hidden="true" />
            <span>You have not selected an accessibility profile.</span>
          </div>
          <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', minHeight: '32px' }}>
            Select Profile
          </Link>
        </div>
      )}

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
        Select Destination
      </h1>
      <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
        Select the tourist site you wish to visit. Currently, our pilot site dataset is loaded.
      </p>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search 
          size={20} 
          color="var(--color-text-muted)" 
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search pilot destinations (e.g. Cubbon Park)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
            fontSize: '1rem',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)'
          }}
          aria-label="Search destinations"
        />
      </div>

      {/* Destination Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredDestinations.map((dest) => {
          const isSelected = selectedDestId === dest.id;
          
          return (
            <div
              key={dest.id}
              className={`card`}
              style={{
                border: isSelected && dest.active ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                opacity: dest.active ? 1 : 0.6,
                backgroundColor: isSelected && dest.active ? 'var(--color-accent-light)' : 'var(--color-card-bg)',
                cursor: dest.active ? 'pointer' : 'not-allowed'
              }}
              onClick={() => dest.active && setSelectedDestId(dest.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <MapPin size={20} color={dest.active ? 'var(--color-accent)' : 'var(--color-text-muted)'} aria-hidden="true" />
                  {dest.name}
                </h2>
                <span className={`badge ${dest.badgeClass}`}>
                  {dest.status}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {dest.description}
              </p>

              {/* Show accessibility attributes if active and selected */}
              {isSelected && dest.active && (
                <div style={{ 
                  backgroundColor: 'var(--color-card-bg)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '0.375rem', 
                  padding: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <BadgeInfo size={16} color="var(--color-accent)" />
                    Tracked Accessibility Attributes
                  </h3>
                  <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <li>♿ <strong>Pathways:</strong> {dest.attributes.pathways}</li>
                    <li>📐 <strong>Ramps:</strong> {dest.attributes.ramps}</li>
                    <li>🪜 <strong>Stairs:</strong> {dest.attributes.stairs}</li>
                    <li>🚶 <strong>Widths:</strong> {dest.attributes.width}</li>
                    <li>💡 <strong>Lighting:</strong> {dest.attributes.lighting}</li>
                    <li>⚠️ <strong>Barriers:</strong> {dest.attributes.barriers}</li>
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verification / Limitation warning */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '0.75rem', 
        backgroundColor: 'var(--color-error-light)', 
        border: '1px solid var(--color-error)', 
        padding: '1rem', 
        borderRadius: '0.75rem',
        marginTop: '2rem'
      }}>
        <ShieldAlert size={24} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '0.15rem' }} aria-hidden="true" />
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Prototype Sample Dataset Disclaimer
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            This application uses a sample demonstration dataset for the pilot area of Cubbon Park. High-precision field verification is pending. Pathway ratings, stairs counts, and barrier coordinates must not be described as physically verified or relied upon for real-world travel safety.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <Link to="/profile" className="btn btn-secondary">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Profiles
        </Link>
        <button 
          onClick={handleContinue} 
          className="btn btn-primary"
          disabled={!selectedDestId}
          aria-label="Continue to Route Planner"
        >
          Plan Route
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

    </div>
  );
}

export default Destination;
