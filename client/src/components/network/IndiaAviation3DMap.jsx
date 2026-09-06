import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  RotateCw, 
  Compass, 
  Layers, 
  Activity, 
  Radio, 
  Eye, 
  ChevronRight, 
  ExternalLink,
  Maximize2,
  Minimize2,
  Filter,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import { AIRPORTS, FLIGHT_CORRIDORS, INDIA_BOUNDARY, AIRSPACE_FIRS } from './indiaGeoData';

// Map lat/long to 3D plane coordinates centered on central India (22°N, 80°E)
function projectGeo(lat, lng, scale = 1.0) {
  const x = (lng - 80.0) * 0.88 * scale;
  const y = (lat - 22.0) * 0.96 * scale;
  return { x, y, z: 0 };
}

export const IndiaAviation3DMap = ({ defaultRoute = 'DEL-BOM', onSelectRoute }) => {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  // Interactive UI state
  const [selectedCorridorId, setSelectedCorridorId] = useState(defaultRoute);
  const [hoveredAirport, setHoveredAirport] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MODERATE' | 'STABLE'
  const [selectedCarrier, setSelectedCarrier] = useState('ALL');
  const [is3DMode, setIs3DMode] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeFlightsCount, setActiveFlightsCount] = useState(148);

  // Selected corridor data
  const activeCorridor = useMemo(() => {
    return FLIGHT_CORRIDORS.find(c => c.id === selectedCorridorId) || FLIGHT_CORRIDORS[0];
  }, [selectedCorridorId]);

  // Filtered corridors list
  const filteredCorridors = useMemo(() => {
    return FLIGHT_CORRIDORS.filter(c => {
      const matchesPressure = 
        selectedFilter === 'ALL' ||
        (selectedFilter === 'HIGH' && c.pressure === 'high') ||
        (selectedFilter === 'MODERATE' && c.pressure === 'moderate') ||
        (selectedFilter === 'STABLE' && c.pressure === 'stable');

      const matchesCarrier = 
        selectedCarrier === 'ALL' ||
        c.activeCarriers.some(carrier => carrier.toLowerCase().includes(selectedCarrier.toLowerCase()));

      return matchesPressure && matchesCarrier;
    });
  }, [selectedFilter, selectedCarrier]);

  // Handle route selection
  const handleCorridorClick = useCallback((corridor) => {
    setSelectedCorridorId(corridor.id);
    if (onSelectRoute) {
      onSelectRoute(corridor.id);
    }
  }, [onSelectRoute]);

  // Three.js Scene Setup & Animation
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Deep stealth navy space

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, -22, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 80);
    pointLight.position.set(0, 5, 25);
    scene.add(pointLight);

    const topLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    topLight.position.set(0, 20, 20);
    scene.add(topLight);

    // 3. Root Group for Rotation / Tilting
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // 4. Background Radar Grid & Graticules
    const gridHelper = new THREE.GridHelper(40, 20, 0x1e293b, 0x0f172a);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -0.2;
    mapGroup.add(gridHelper);

    // Radar Concentric Range Rings centered on Nagpur / Central India (0, 0)
    [6, 12, 18, 24].forEach((radius) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.03, radius, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e3a5f, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      mapGroup.add(ringMesh);
    });

    // 5. India Country Outline Polygon Vector
    const boundaryPoints = INDIA_BOUNDARY.map(([lat, lng]) => {
      const p = projectGeo(lat, lng);
      return new THREE.Vector3(p.x, p.y, 0);
    });
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2, transparent: true, opacity: 0.85 });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    mapGroup.add(boundaryLine);

    // Subtle glow backing for India outline
    const glowMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 4, transparent: true, opacity: 0.3 });
    const glowLine = new THREE.Line(boundaryGeo, glowMat);
    glowLine.position.z = -0.05;
    mapGroup.add(glowLine);

    // 6. Airport Hub Nodes (Spheres + Pulsating concentric wave rings)
    const airportMeshes = [];
    const pulseRings = [];

    Object.values(AIRPORTS).forEach(ap => {
      const pos = projectGeo(ap.lat, ap.lng);

      // Size based on annual passenger traffic
      const radius = 0.22 + Math.min(ap.paxM / 80, 0.45);
      const color = ap.code === 'DEL' || ap.code === 'BOM' ? 0x38bdf8 : 0x818cf8;

      // Hub Sphere
      const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.2
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(pos.x, pos.y, 0.1);
      sphereMesh.userData = { airport: ap };
      mapGroup.add(sphereMesh);
      airportMeshes.push(sphereMesh);

      // Concentric Pulsating Beacon Wave
      const ringGeo = new THREE.RingGeometry(radius + 0.1, radius + 0.22, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(pos.x, pos.y, 0.05);
      mapGroup.add(ringMesh);

      pulseRings.push({
        mesh: ringMesh,
        baseScale: 1.0,
        speed: 0.015 + (ap.paxM / 120) * 0.01,
        phase: Math.random() * Math.PI * 2
      });
    });

    // 7. Parabolic 3D Flight Arcs & Flying Photons
    const corridorObjects = [];
    const flyingPhotons = [];

    filteredCorridors.forEach((corridor, idx) => {
      const orig = AIRPORTS[corridor.from];
      const dest = AIRPORTS[corridor.to];
      if (!orig || !dest) return;

      const p1 = projectGeo(orig.lat, orig.lng);
      const p2 = projectGeo(dest.lat, dest.lng);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Arc peak height in Z (higher altitude for long routes)
      const zPeak = Math.min(dist * 0.48 + 0.8, 5.2);
      const midPoint = new THREE.Vector3(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2,
        zPeak
      );

      const v1 = new THREE.Vector3(p1.x, p1.y, 0.1);
      const v2 = new THREE.Vector3(p2.x, p2.y, 0.1);

      // Quadratic Bezier Parabolic Flight Curve
      const curve = new THREE.QuadraticBezierCurve3(v1, midPoint, v2);
      const points = curve.getPoints(48);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      // Color mapping: Red (High Pressure Surge), Cyan (Trunk), Emerald (Stable)
      let arcColor = 0x38bdf8; // Cyan default
      if (corridor.pressure === 'high') arcColor = 0xf43f5e; // Rose / Red
      if (corridor.pressure === 'stable') arcColor = 0x10b981; // Emerald

      const isSelected = corridor.id === selectedCorridorId;
      const arcMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0xfbbf24 : arcColor, // Gold when selected
        linewidth: isSelected ? 3 : 1.5,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.65
      });

      const lineMesh = new THREE.Line(curveGeo, arcMat);
      lineMesh.userData = { corridor };
      mapGroup.add(lineMesh);
      corridorObjects.push({ lineMesh, curve, corridor });

      // Add animated flying flight photons (1-2 aircraft per corridor)
      const numAircraft = Math.max(1, Math.floor(corridor.flightsDaily / 30));
      for (let a = 0; a < numAircraft; a++) {
        const photonGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const photonMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xffffff : arcColor,
          transparent: true,
          opacity: 0.95
        });
        const photonMesh = new THREE.Mesh(photonGeo, photonMat);
        mapGroup.add(photonMesh);

        flyingPhotons.push({
          mesh: photonMesh,
          curve,
          t: (idx * 0.2 + a * 0.5) % 1.0,
          speed: 0.0035 + (idx % 3) * 0.001,
          direction: a % 2 === 0 ? 1 : -1
        });
      }
    });

    // 8. Rotating 360° Aviation Radar Beam
    const radarBeamGeo = new THREE.RingGeometry(0.2, 24, 32, 1, 0, Math.PI / 4);
    const radarBeamMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12
    });
    const radarBeam = new THREE.Mesh(radarBeamGeo, radarBeamMat);
    radarBeam.position.z = -0.1;
    mapGroup.add(radarBeam);

    // 9. Interactive Drag Orbit & Raycasting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = is3DMode ? 0.45 : 0.0;
    let rotZ = 0.0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        rotZ += deltaX * 0.006;
        rotX = Math.max(0.0, Math.min(1.1, rotX + deltaY * 0.005));
      }

      // Raycasting for interactive hover
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersectsAirports = raycaster.intersectObjects(airportMeshes);
      if (intersectsAirports.length > 0) {
        container.style.cursor = 'pointer';
        const ap = intersectsAirports[0].object.userData.airport;
        setHoveredAirport(ap);
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
        setHoveredAirport(null);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Check click on airports
      const intersectsAirports = raycaster.intersectObjects(airportMeshes);
      if (intersectsAirports.length > 0) {
        const ap = intersectsAirports[0].object.userData.airport;
        // Find first corridor from or to this airport
        const matched = FLIGHT_CORRIDORS.find(c => c.from === ap.code || c.to === ap.code);
        if (matched) {
          handleCorridorClick(matched);
        }
        return;
      }

      // Check click on flight arcs
      const lineMeshes = corridorObjects.map(o => o.lineMesh);
      const intersectsLines = raycaster.intersectObjects(lineMeshes);
      if (intersectsLines.length > 0) {
        const corr = intersectsLines[0].object.userData.corridor;
        if (corr) {
          handleCorridorClick(corr);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Rotate radar beam
      radarBeam.rotation.z += 0.8 * delta;

      // Auto-orbit when enabled and not actively dragging
      if (autoRotate && !isDragging) {
        rotZ += 0.12 * delta;
      }

      // Apply rotations smoothly
      mapGroup.rotation.x = rotX;
      mapGroup.rotation.z = rotZ;

      // Pulsate airport radar rings
      pulseRings.forEach(ring => {
        ring.phase += ring.speed;
        const scale = 1.0 + 0.8 * (Math.sin(ring.phase) * 0.5 + 0.5);
        ring.mesh.scale.set(scale, scale, 1);
        ring.mesh.material.opacity = Math.max(0.1, 0.8 - (scale - 1.0) * 0.7);
      });

      // Move flying aircraft photons along flight paths
      flyingPhotons.forEach(photon => {
        photon.t = (photon.t + photon.speed * photon.direction + 1.0) % 1.0;
        const pos = photon.curve.getPoint(photon.t);
        photon.mesh.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Container Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [filteredCorridors, selectedCorridorId, is3DMode, autoRotate, handleCorridorClick]);

  return (
    <div className={`relative bg-[#0a0f1d] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-white transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
    }`}>
      {/* 1. Header Toolbar & Real-Time Airspace Status HUD */}
      <div className="absolute top-0 inset-x-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-b from-[#0a0f1d]/90 via-[#0a0f1d]/60 to-transparent backdrop-blur-xs pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>DGCA National Airspace 3D Corridor Radar</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-semibold">
                  LIVE 3D
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Tracking 20 Core City-Pairs</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-mono font-medium">{activeFlightsCount} Flights Active</span>
                <span className="text-slate-600">·</span>
                <span>82.4% Domestic Passenger Traffic Basket</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap text-xs">
          {/* Filter by Price Pressure */}
          <div className="flex items-center bg-slate-900/80 border border-slate-700/80 rounded-lg p-0.5 backdrop-blur-md">
            {[
              { id: 'ALL', label: 'All Corridors' },
              { id: 'HIGH', label: 'High Surge (>122)' },
              { id: 'MODERATE', label: 'Moderate' },
              { id: 'STABLE', label: 'Cooling' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Perspective Switcher */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              is3DMode 
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/40' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle 3D Perspective Orbit vs 2D Planar View"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>{is3DMode ? '3D Orbit' : '2D Radar'}</span>
          </button>

          {/* Auto-Rotate Switcher */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              autoRotate 
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle auto-orbit rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">Auto-Orbit</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Radar Map"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. WebGL 3D Canvas Container */}
      <div 
        ref={mountRef} 
        className={`w-full ${isFullscreen ? 'h-screen' : 'h-[520px]'} cursor-grab active:cursor-grabbing select-none`}
      />

      {/* 3. Floating Interactive Flight Corridor Telemetry HUD (Framer Motion) */}
      <AnimatePresence>
        {activeCorridor && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-4 left-4 z-20 max-w-sm w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-white pointer-events-auto"
          >
            {/* Corridor Header */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-blue-400">
                    {activeCorridor.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                    activeCorridor.pressure === 'high'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : activeCorridor.pressure === 'stable'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {activeCorridor.pressure} Yield Pressure
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">
                  {activeCorridor.label}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold font-mono text-emerald-400 leading-none tabular-nums">
                  ₹{activeCorridor.avgFare.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Base: ₹{activeCorridor.baselineFare}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-slate-800/80 text-center">
              <div className="bg-slate-800/60 rounded-lg p-2 border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">Price Index</div>
                <div className="text-sm font-bold font-mono text-blue-300 mt-0.5 tabular-nums">
                  {activeCorridor.index}
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-lg p-2 border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">24h Shift</div>
                <div className={`text-sm font-bold font-mono mt-0.5 tabular-nums ${
                  activeCorridor.dodChange >= 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {activeCorridor.dodChange > 0 ? `+${activeCorridor.dodChange}%` : `${activeCorridor.dodChange}%`}
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-lg p-2 border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-medium">Volatility (σ)</div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-0.5 tabular-nums">
                  {activeCorridor.volatility}
                </div>
              </div>
            </div>

            {/* Flight Information Footer */}
            <div className="pt-2.5 flex items-center justify-between text-[11px] text-slate-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Flight Duration: <strong className="text-slate-200">{activeCorridor.duration}</strong></span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  Carriers: {activeCorridor.activeCarriers.join(', ')}
                </div>
              </div>

              <button
                onClick={() => navigate(`/index/routes/${activeCorridor.id}`)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Hovered Airport Tooltip HUD */}
      <AnimatePresence>
        {hoveredAirport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 right-4 z-20 bg-slate-900/90 border border-blue-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md pointer-events-none text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-400 text-sm">{hoveredAirport.code}</span>
              <span className="text-slate-200 font-semibold">{hoveredAirport.city}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                {hoveredAirport.fir}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {hoveredAirport.name}
            </div>
            <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Annual Traffic:</span>
              <span className="font-mono font-bold text-emerald-400">{hoveredAirport.paxM}M Pax</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Bottom Right Radar Legend */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs text-[11px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 rounded-full bg-rose-500"></span>
          <span>Yield Surge (&gt;122)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 rounded-full bg-sky-400"></span>
          <span>Moderate (115-122)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 rounded-full bg-emerald-400"></span>
          <span>Cooling (&lt;115)</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-slate-300 font-mono">Live Particle Photons</span>
        </div>
      </div>
    </div>
  );
};
