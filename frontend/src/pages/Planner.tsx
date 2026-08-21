import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { 
  Volume2, VolumeX, AlertTriangle, ShieldAlert, Navigation, 
  RefreshCw, Layers, HelpCircle 
} from 'lucide-react';

interface PlannerProps {
  selectedProfile: string;
  selectedProfileName: string;
  onSelectProfile: (id: string, name: string) => void;
}

interface RouteEdge {
  id: string;
  source: string;
  target: string;
  distance: number;
  stairs_count: number;
  ramp_available: boolean;
  slope_pct: number;
  path_width: number;
  lighting_level: string;
  temp_barrier_status: boolean;
  last_verified: string;
  confidence_score: string;
  notes: string;
}

interface GuidanceStep {
  instruction: string;
  visual_alert: string | null;
  distance_to_next: number;
}

interface RouteInfo {
  route_id: string;
  name: string;
  path: string[];
  coordinates: number[][];
  distance_m: number;
  duration_mins: number;
  accessibility_score: number;
  stairs_count: number;
  ramp_available: boolean;
  max_slope_pct: number;
  min_width_m: number;
  surface_condition: string;
  lighting: string;
  barriers_count: number;
  last_verified: string;
  confidence: string;
  status: string;
  reasons: string[];
  edges: RouteEdge[];
  guidance: GuidanceStep[];
}

interface Barrier {
  id: string;
  barrier_type: string;
  description: string;
  location_description: string;
  edge_id: string;
  severity: string;
  reported_at: string;
}

function Planner({ selectedProfile, selectedProfileName, onSelectProfile }: PlannerProps) {
  // Application State
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string>('');

  // Barrier Form State
  const [barrierType, setBarrierType] = useState<string>('blocked_ramp');
  const [barrierDesc, setBarrierDesc] = useState<string>('');
  const [barrierLocation, setBarrierLocation] = useState<string>('');
  const [affectedEdgeId, setAffectedEdgeId] = useState<string>('edge_junc1_junc3');
  const [severity, setSeverity] = useState<string>('high');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pathLayersRef = useRef<L.Polyline[]>([]);
  const markerLayersRef = useRef<L.Layer[]>([]);

  const activeRoute = routes.find(r => r.route_id === selectedRouteId);

  // Fetch routes and barriers from the FastAPI backend
  const fetchData = async () => {
    if (!selectedProfile) return;

    setBackendError('');
    try {
      // 1. Fetch evaluated routes
      const routesResponse = await fetch('/api/routes/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: selectedProfile,
          destination_id: 'cubbon_park'
        })
      });
      if (!routesResponse.ok) {
        throw new Error(`Routes API error: ${routesResponse.statusText}`);
      }
      const routesData = await routesResponse.json();
      setRoutes(routesData.routes);

      // Auto-select the Recommended route if none selected or the previously selected is now rejected
      const recommended = routesData.routes.find((r: RouteInfo) => r.status === 'Recommended');
      const prevStillSuitable = routesData.routes.find((r: RouteInfo) => r.route_id === selectedRouteId && r.status !== 'Rejected');
      
      if (recommended && (!selectedRouteId || !prevStillSuitable)) {
        setSelectedRouteId(recommended.route_id);
        setActiveStepIndex(0);
      }

      // 2. Fetch active barriers list
      const barriersResponse = await fetch('/api/barriers');
      if (barriersResponse.ok) {
        const barriersData = await barriersResponse.json();
        setBarriers(barriersData);
      }

    } catch (err: any) {
      console.error(err);
      setBackendError('FastAPI backend is offline. Run the backend server to enable dynamic routes & reporting.');
    }
  };

  // Run initial fetch on mount and whenever selectedProfile changes
  useEffect(() => {
    if (selectedProfile) {
      fetchData();
    }
  }, [selectedProfile]);

  // Screen Reader Speech Synthesis wrapper
  const speakInstruction = (text: string) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNextStep = () => {
    if (!activeRoute) return;
    if (activeStepIndex < activeRoute.guidance.length - 1) {
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      speakInstruction(activeRoute.guidance[nextIndex].instruction);
    }
  };

  const handlePrevStep = () => {
    if (!activeRoute) return;
    if (activeStepIndex > 0) {
      const prevIndex = activeStepIndex - 1;
      setActiveStepIndex(prevIndex);
      speakInstruction(activeRoute.guidance[prevIndex].instruction);
    }
  };

  // Submit Barrier Report
  const handleSubmitBarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barrierDesc || !barrierLocation) {
      alert('Please fill in description and location.');
      return;
    }

    try {
      const response = await fetch('/api/barriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barrier_type: barrierType,
          description: barrierDesc,
          location_description: barrierLocation,
          edge_id: affectedEdgeId,
          severity: severity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post barrier report.');
      }

      setFormSuccess('Barrier reported successfully! Rerouting engine triggered.');
      announceLiveRegion(`Alert: Barrier reported at ${barrierLocation}. Accessible routes recalculated.`);

      // Reset form fields
      setBarrierDesc('');
      setBarrierLocation('');

      // Refresh map and routes comparison
      await fetchData();

      setTimeout(() => {
        setFormSuccess('');
      }, 5000);

    } catch (err) {
      alert('Failed to report barrier. Check backend connection.');
    }
  };

  // Triggered helper to post speech or changes to screen readers
  const announceLiveRegion = (msg: string) => {
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.innerText = msg;
    }
  };

  // Reset Demo flow
  const handleResetDemo = async () => {
    try {
      const response = await fetch('/api/barriers/demo-reset', {
        method: 'DELETE'
      });
      if (response.ok) {
        announceLiveRegion('Demo reset. Barriers cleared and default routes restored.');
        setSelectedRouteId('route_b');
        setActiveStepIndex(0);
        await fetchData();
      }
    } catch (err) {
      alert('Failed to reset backend demo.');
    }
  };

  // Quick Demo Shortcut for wheelchair barrier simulation
  const handleSimulateBarrier = async () => {
    // Report a blocked ramp on edge_junc1_junc3
    try {
      const response = await fetch('/api/barriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barrier_type: 'blocked_ramp',
          description: 'A temporary construction fence is blocking the entrance to the Bamboo Grove ramp transition.',
          location_description: 'Bamboo Grove Entrance (Segment 4)',
          edge_id: 'edge_junc1_junc3',
          severity: 'high'
        })
      });
      if (response.ok) {
        announceLiveRegion('Barrier simulated on Route B. Recalculating alternative paths.');
        await fetchData();
      }
    } catch (err) {
      alert('Simulation failed. Check if FastAPI backend is running.');
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map Instance if it doesn't exist
    if (!mapInstanceRef.current) {
      // Centered on Cubbon Park pilot site
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [12.9755, 77.5940],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear previous vector layers and markers
    pathLayersRef.current.forEach(layer => map.removeLayer(layer));
    pathLayersRef.current = [];
    markerLayersRef.current.forEach(layer => map.removeLayer(layer));
    markerLayersRef.current = [];

    // Helper to generate marker icons based on state
    const createMarkerIcon = (color: string) => {
      const svg = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="3" fill="#ffffff"/>
        </svg>
      `;
      return L.divIcon({
        html: svg,
        className: 'custom-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
    };

    // Draw static Nodes on the map
    const nodeCoords: Record<string, [number, number]> = {
      entrance: [12.9760, 77.5925],
      junc_1: [12.9755, 77.5935],
      junc_2_stairs: [12.9750, 77.5940],
      junc_3_ramp: [12.9758, 77.5945],
      junc_4_alt: [12.9765, 77.5955],
      destination: [12.9745, 77.5950]
    };

    // Plot entrance and destination markers prominently
    const entranceMarker = L.marker(nodeCoords.entrance, {
      icon: createMarkerIcon('#10B981') // Green for start
    }).bindPopup('<b>Hudson Circle Entrance</b><br/>Start point for prototype routing.').addTo(map);
    markerLayersRef.current.push(entranceMarker);

    const destinationMarker = L.marker(nodeCoords.destination, {
      icon: createMarkerIcon('#EF4444') // Red for end
    }).bindPopup('<b>Band Stand / Destination</b><br/>Cubbon Park Historical Landmark.').addTo(map);
    markerLayersRef.current.push(destinationMarker);

    // Plot intermediate junction markers
    Object.entries(nodeCoords).forEach(([key, coords]) => {
      if (key !== 'entrance' && key !== 'destination') {
        const title = key.replace('_', ' ').toUpperCase();
        const junctionMarker = L.marker(coords, {
          icon: L.divIcon({
            html: `<div style="background-color: #334155; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid white;"></div>`,
            className: 'junc-point',
            iconSize: [8, 8],
            iconAnchor: [4, 4]
          })
        }).bindPopup(`<b>Junction Point</b><br/>${title}`).addTo(map);
        markerLayersRef.current.push(junctionMarker);
      }
    });

    // Draw Route Polylines
    routes.forEach(route => {
      const isSelected = route.route_id === selectedRouteId;
      
      let lineColor = '#94A3B8'; // gray for default
      let lineWeight = 4;
      let lineDash = '';

      if (route.status === 'Rejected') {
        lineColor = '#EF4444'; // Red rejected
        lineWeight = 4;
      } else if (route.status === 'Recommended') {
        lineColor = '#0D9488'; // Teal recommended
        lineWeight = isSelected ? 8 : 5;
      } else if (route.status === 'Suitable with Caution') {
        lineColor = '#3B82F6'; // Blue caution
        lineWeight = isSelected ? 8 : 5;
        lineDash = '5, 10'; // dashed
      }

      // Convert coordinates into Leaflet LatLng expressions
      const latlngs = route.coordinates.map(c => L.latLng(c[0], c[1]));

      const polyline = L.polyline(latlngs, {
        color: lineColor,
        weight: lineWeight,
        dashArray: lineDash,
        opacity: isSelected ? 0.95 : 0.6,
        interactive: true
      }).addTo(map);

      polyline.bindPopup(`
        <b>${route.name}</b><br/>
        Status: <b>${route.status}</b><br/>
        Score: ${route.accessibility_score}/100<br/>
        Distance: ${route.distance_m}m
      `);

      // Click to select route from map
      polyline.on('click', () => {
        setSelectedRouteId(route.route_id);
        setActiveStepIndex(0);
      });

      pathLayersRef.current.push(polyline);
    });

    // Draw active reported barrier markers
    barriers.forEach(barrier => {
      // Find the midpoint of the affected edge to draw barrier icon
      // In this prototype, we'll draw it on the midpoint of the J1 -> J3 segment or whichever edge matches
      let coords: [number, number] = [12.97565, 77.5940]; // default midpoint
      if (barrier.edge_id === 'edge_junc2_destination') {
        coords = [12.97475, 77.5945];
      } else if (barrier.edge_id === 'edge_entrance_junc1') {
        coords = [12.97575, 77.5930];
      } else if (barrier.edge_id === 'edge_junc1_junc4') {
        coords = [12.9760, 77.5945];
      } else if (barrier.edge_id === 'edge_junc4_destination') {
        coords = [12.9755, 77.59525];
      }

      const barrierIcon = L.divIcon({
        html: `
          <div style="background-color: #F59E0B; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <span style="font-size: 14px; font-weight: bold; color: black;">⚠️</span>
          </div>
        `,
        className: 'barrier-map-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const barrierMarker = L.marker(coords, { icon: barrierIcon })
        .bindPopup(`
          <b style="color: #D97706;">⚠️ ACTIVE BARRIER REPORTED</b><br/>
          <b>Type:</b> ${barrier.barrier_type.replace('_', ' ')}<br/>
          <b>Description:</b> ${barrier.description}<br/>
          <b>Reported At:</b> ${new Date(barrier.reported_at).toLocaleTimeString()}
        `)
        .addTo(map);

      markerLayersRef.current.push(barrierMarker);
    });

  }, [routes, barriers, selectedRouteId]);

  return (
    <div>
      {/* Dynamic Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            Active Pilot Destination
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Cubbon Park Route Planner
          </h1>
        </div>

        {/* Selected Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-card-bg)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.9rem' }}>
            Profile: <strong>{selectedProfileName || 'None Selected'}</strong>
          </span>
          <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minHeight: '32px' }}>
            Change
          </Link>
        </div>
      </div>

      {/* Backend Offline Fallback */}
      {backendError && (
        <div style={{ 
          backgroundColor: 'var(--color-error-light)', 
          border: '1px solid var(--color-error)', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <ShieldAlert size={20} color="var(--color-error)" />
          <span>{backendError}</span>
        </div>
      )}

      {/* ---------------- JUDGES DEMO CONTROL BAR ---------------- */}
      <div className="demo-bar" role="region" aria-label="Hackathon Demo Setup Panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: 'var(--color-warning)', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.25rem' }}>
            DEMO MODE
          </span>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            Use these shortcuts to simulate the hackathon workflow step-by-step.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => onSelectProfile('wheelchair', 'Wheelchair Mode')}
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', minHeight: '38px' }}
            title="Switch profile to Wheelchair"
          >
            1. Select Wheelchair Mode
          </button>
          
          <button 
            onClick={handleSimulateBarrier}
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', minHeight: '38px', backgroundColor: 'var(--color-warning-light)', borderColor: 'var(--color-warning)' }}
            title="Post a blocked ramp report on Route B segment"
          >
            2. Simulate Blocked Ramp
          </button>

          <button 
            onClick={handleResetDemo}
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', minHeight: '38px' }}
            title="Reset simulated barriers"
          >
            <RefreshCw size={14} style={{ marginRight: '2px' }} />
            Reset Demo
          </button>
        </div>
      </div>

      {/* Missing Profile State */}
      {!selectedProfile ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
          <HelpCircle size={48} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Profile Selected</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Please select an accessibility profile first to calculate suitable routes.
          </p>
          <Link to="/profile" className="btn btn-primary">
            Select Accessibility Profile
          </Link>
        </div>
      ) : (
        <div className="planner-layout">
          
          {/* LEFT SIDE: MAP & DIRECTION GUIDANCE */}
          <div>
            {/* Leaflet Map Div Container */}
            <div ref={mapContainerRef} className="map-container" id="map-id" style={{ minHeight: '450px' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', padding: '0 0.5rem' }}>
              <span>🟢 Green = Hudson Circle Gate</span>
              <span>🔴 Red = Band Stand Destination</span>
              <span>⚠️ Orange = Active Obstacle Barrier</span>
            </div>

            {/* Step-by-Step Voice & Visual Guidance Panel */}
            {activeRoute && activeRoute.status !== 'Rejected' && (
              <div className="guidance-box" role="region" aria-label="Route Guidance Instructions">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation size={20} color="var(--color-accent)" aria-hidden="true" />
                    Guidance: {activeRoute.name}
                  </h2>

                  {/* Speech buttons */}
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="a11y-btn" 
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.35rem 0.75rem', minHeight: '38px' }}
                    aria-label={isMuted ? 'Unmute speech directions' : 'Mute speech directions'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isMuted ? 'Unmuted (Off)' : 'Speech (On)'}</span>
                  </button>
                </div>

                {/* Progress Indicators */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', width: '100%', marginBottom: '1rem' }}>
                  <div 
                    style={{ 
                      backgroundColor: 'var(--color-accent)', 
                      height: '100%', 
                      borderRadius: '2px', 
                      width: `${((activeStepIndex + 1) / activeRoute.guidance.length) * 100}%`,
                      transition: 'width 0.2s ease-in-out'
                    }}
                  ></div>
                </div>

                {/* Active Step Content */}
                <div style={{ minHeight: '80px', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    Step {activeStepIndex + 1} of {activeRoute.guidance.length}:
                    <br />
                    <span style={{ fontSize: '1.2rem', color: '#ffffff', display: 'block', marginTop: '0.5rem' }}>
                      {activeRoute.guidance[activeStepIndex]?.instruction}
                    </span>
                  </p>

                  {/* Visual flashing alerts for hearing mode or cautions */}
                  {activeRoute.guidance[activeStepIndex]?.visual_alert && (
                    <div className="direction-alert" role="alert">
                      {activeRoute.guidance[activeStepIndex].visual_alert}
                    </div>
                  )}
                </div>

                {/* Guidance Navigation Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={handlePrevStep} 
                    disabled={activeStepIndex === 0} 
                    className="btn btn-secondary" 
                    style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', flex: 1 }}
                    aria-label="Previous step"
                  >
                    Previous Step
                  </button>
                  <button 
                    onClick={handleNextStep} 
                    disabled={activeStepIndex === activeRoute.guidance.length - 1} 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    aria-label="Next step"
                  >
                    Next Step
                  </button>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.75rem', textAlign: 'center' }}>
                  📢 Voice synthesis utilizes the local Web Speech API. GPS simulation pending field verification.
                </p>
              </div>
            )}
            
            {activeRoute && activeRoute.status === 'Rejected' && (
              <div style={{ 
                backgroundColor: 'var(--color-error-light)', 
                border: '1px solid var(--color-error)', 
                padding: '1.5rem', 
                borderRadius: '0.75rem', 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                <ShieldAlert size={36} color="var(--color-error)" style={{ margin: '0 auto 0.5rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Route Navigation Blocked</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  This route is marked <strong>Rejected</strong> for your selected profile. Navigation guidance is unavailable.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: ROUTE COMPARISONS & BARRIER REPORTING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Route comparison panel cards */}
            <div style={{ backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <Layers size={20} color="var(--color-accent)" />
                Route Alternatives
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Compare available paths. The custom router ranks routes using accessibility rules.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {routes.map((route) => {
                  const isSelected = route.route_id === selectedRouteId;
                  
                  let statusColor = 'status-recommended';
                  let statusBg = 'var(--color-accent-light)';
                  if (route.status === 'Rejected') {
                    statusColor = 'status-rejected';
                    statusBg = 'var(--color-error-light)';
                  } else if (route.status === 'Suitable with Caution') {
                    statusColor = 'status-caution';
                    statusBg = 'var(--color-warning-light)';
                  }

                  return (
                    <div
                      key={route.route_id}
                      style={{
                        border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        backgroundColor: isSelected ? 'var(--color-accent-light)' : '#ffffff',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedRouteId(route.route_id);
                        setActiveStepIndex(0);
                        speakInstruction(`Selected ${route.name}. Status is ${route.status}.`);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {route.name}
                        </span>
                        <span className={`badge`} style={{ backgroundColor: statusBg }}>
                          <span className={statusColor}>{route.status}</span>
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                        <span>📏 Distance: <strong>{route.distance_m}m</strong></span>
                        <span>⏱️ Est. Time: <strong>{route.duration_mins} mins</strong></span>
                        <span>🛡️ Access Score: <strong>{route.accessibility_score}/100</strong></span>
                        <span>💡 Lighting: <strong>{route.lighting}</strong></span>
                        <span>🪜 Stairs: <strong>{route.stairs_count} steps</strong></span>
                        <span>📐 Ramp: <strong>{route.ramp_available ? 'Available' : 'None'}</strong></span>
                        <span>⛰️ Max Slope: <strong>{route.max_slope_pct}%</strong></span>
                        <span>🚶 Min Width: <strong>{route.min_width_m}m</strong></span>
                        <span>📅 Verified: <strong>{route.confidence}</strong></span>
                        <span>⚠️ Barriers: <strong>{route.barriers_count}</strong></span>
                      </div>

                      {/* Display decision explanations */}
                      <div style={{ backgroundColor: '#F8FAFC', borderLeft: '3px solid var(--color-accent)', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                        <strong>Decision Reason:</strong>
                        <ul style={{ listStyleType: 'none', margin: '0.25rem 0 0 0' }}>
                          {route.reasons.map((reason, idx) => (
                            <li key={idx} style={{ color: 'var(--color-text-muted)' }}>• {reason}</li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---------------- Dynamic Barrier Reporting Form ---------------- */}
            <div style={{ backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <AlertTriangle size={20} color="var(--color-warning)" />
                Crowdsource: Report Barrier
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Encountered an obstacle? Report it here to trigger real-time route rerouting.
              </p>

              {formSuccess && (
                <div style={{ backgroundColor: 'var(--color-accent-light)', border: '1px solid var(--color-accent)', padding: '0.75rem', borderRadius: '0.375rem', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }} role="alert">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitBarrier} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label htmlFor="barrier-type-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Obstacle Barrier Type
                  </label>
                  <select
                    id="barrier-type-select"
                    value={barrierType}
                    onChange={(e) => setBarrierType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  >
                    <option value="blocked_ramp">Blocked Ramp / Lift Out of Service</option>
                    <option value="broken_lift">Broken Lift Escalator</option>
                    <option value="construction">Narrow Path due to Construction</option>
                    <option value="uneven_surface">Uneven / Cracked Pavement Surface</option>
                    <option value="narrow_path">Narrow Pathway Obstruction (&lt; 1.0m)</option>
                    <option value="temporary_closure">Temporary Path Closure</option>
                    <option value="other">Other Accessibility Obstacle</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="barrier-segment-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Affected Pathway Segment
                  </label>
                  <select
                    id="barrier-segment-select"
                    value={affectedEdgeId}
                    onChange={(e) => setAffectedEdgeId(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  >
                    <option value="edge_entrance_junc1">Hudson Entrance ➔ central Promenade (Main Entrance)</option>
                    <option value="edge_junc1_junc2">Central Promenade ➔ King Edward Statue (Stairs Route)</option>
                    <option value="edge_junc2_destination">King Edward Statue ➔ Band Stand (Stairs Segment)</option>
                    <option value="edge_junc1_junc3">Central Promenade ➔ Bamboo Grove (Ramp Route - B)</option>
                    <option value="edge_junc3_destination">Bamboo Grove ➔ Band Stand (Ramp Segment - B)</option>
                    <option value="edge_junc1_junc4">Central Promenade ➔ Outer Loop Trail (Alternate - C)</option>
                    <option value="edge_junc4_destination">Outer Loop Trail ➔ Band Stand (Alternate - C)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="barrier-location-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Location Landmark / Description
                  </label>
                  <input
                    id="barrier-location-input"
                    type="text"
                    placeholder="e.g. Near the flower beds approach"
                    value={barrierLocation}
                    onChange={(e) => setBarrierLocation(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="barrier-desc-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Short Description
                  </label>
                  <textarea
                    id="barrier-desc-input"
                    rows={2}
                    placeholder="e.g. Fallen tree branch fully blocks the transition ramp."
                    value={barrierDesc}
                    onChange={(e) => setBarrierDesc(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontFamily: 'inherit' }}
                    required
                  />
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Severity</span>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <input type="radio" name="severity" value="low" checked={severity === 'low'} onChange={() => setSeverity('low')} />
                      Low
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <input type="radio" name="severity" value="medium" checked={severity === 'medium'} onChange={() => setSeverity('medium')} />
                      Medium
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <input type="radio" name="severity" value="high" checked={severity === 'high'} onChange={() => setSeverity('high')} />
                      High (Reroute)
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Submit Barrier Report
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Planner;
