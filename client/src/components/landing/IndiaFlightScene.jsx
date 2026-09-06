import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { INDIA_BOUNDARY, AIRPORTS } from '../network/indiaGeoData';

// Map lat/long to 3D plane coordinates centered on central India (22°N, 80°E)
function projectGeo(lat, lng, scale = 1.0) {
  const x = (lng - 80.0) * 0.90 * scale;
  const y = (lat - 22.0) * 0.98 * scale;
  return { x, y, z: 0 };
}

// Sleek minimal procedural aircraft model
function createMiniAirliner(scale = 0.9, finColor = 0x38bdf8) {
  const group = new THREE.Group();

  // Fuselage
  const bodyGeo = new THREE.CylinderGeometry(0.09 * scale, 0.06 * scale, 1.0 * scale, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Nose cone
  const noseGeo = new THREE.ConeGeometry(0.09 * scale, 0.28 * scale, 8);
  noseGeo.rotateX(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.position.z = 0.64 * scale;
  group.add(nose);

  // Wings
  const wingGeo = new THREE.BoxGeometry(1.35 * scale, 0.02 * scale, 0.28 * scale);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    metalness: 0.6,
    roughness: 0.3
  });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(0, 0, 0.04 * scale);
  group.add(wing);

  // Tail fin
  const finGeo = new THREE.BoxGeometry(0.025 * scale, 0.3 * scale, 0.2 * scale);
  const finMat = new THREE.MeshStandardMaterial({ color: finColor, roughness: 0.2 });
  const fin = new THREE.Mesh(finGeo, finMat);
  fin.position.set(0, 0.15 * scale, -0.42 * scale);
  group.add(fin);

  return group;
}

// Major 6 Hubs for Editorial Focus
const EDITORIAL_HUBS = ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU'];

// Signature Editorial Routes
const EDITORIAL_ROUTES = [
  { id: 'DEL-BOM', from: 'DEL', to: 'BOM', label: 'Delhi ↔ Mumbai', color: 0x38bdf8 },
  { id: 'DEL-BLR', from: 'DEL', to: 'BLR', label: 'Delhi ↔ Bengaluru', color: 0x818cf8 },
  { id: 'BOM-BLR', from: 'BOM', to: 'BLR', label: 'Mumbai ↔ Bengaluru', color: 0x34d399 },
  { id: 'BLR-HYD', from: 'BLR', to: 'HYD', label: 'Bengaluru ↔ Hyderabad', color: 0x38bdf8 },
  { id: 'MAA-DEL', from: 'MAA', to: 'DEL', label: 'Chennai ↔ Delhi', color: 0x818cf8 },
  { id: 'DEL-CCU', from: 'DEL', to: 'CCU', label: 'Delhi ↔ Kolkata', color: 0x38bdf8 }
];

export const IndiaFlightScene = () => {
  const mountRef = useRef(null);
  const [hoveredHub, setHoveredHub] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 560;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    // Fixed camera, positioned slightly south with upward isometric tilt (North is up)
    camera.position.set(0, -20, 26);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 3.0, 60);
    pointLight.position.set(0, 5, 20);
    scene.add(pointLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    rimLight.position.set(-10, 10, 15);
    scene.add(rimLight);

    // 3. Main Scene Group (strictly non-rotating)
    const worldGroup = new THREE.Group();
    // Fixed tilt: North up, slight 3D elevation
    worldGroup.rotation.x = 0.38;
    scene.add(worldGroup);

    // 4. Subtle India Boundary Silhouette Polygon
    const boundaryPoints = INDIA_BOUNDARY.map(([lat, lng]) => {
      const p = projectGeo(lat, lng);
      return new THREE.Vector3(p.x, p.y, 0);
    });
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);

    // Elegant glowing line for India vector
    const boundaryMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.75
    });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    worldGroup.add(boundaryLine);

    // Soft halo backing line
    const haloMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      linewidth: 3,
      transparent: true,
      opacity: 0.25
    });
    const haloLine = new THREE.Line(boundaryGeo, haloMat);
    haloLine.position.z = -0.05;
    worldGroup.add(haloLine);

    // 5. Major Aviation Hubs (Glowing points + beacon waves)
    const hubMeshes = [];
    const pulseRings = [];

    EDITORIAL_HUBS.forEach((code) => {
      const ap = AIRPORTS[code];
      if (!ap) return;

      const pos = projectGeo(ap.lat, ap.lng);

      // Core Hub Sphere
      const sphereGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.9,
        roughness: 0.1
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(pos.x, pos.y, 0.12);
      sphere.userData = { airport: ap };
      worldGroup.add(sphere);
      hubMeshes.push(sphere);

      // Atmospheric Beacon Pulse Ring
      const ringGeo = new THREE.RingGeometry(0.45, 0.58, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(pos.x, pos.y, 0.08);
      worldGroup.add(ringMesh);

      pulseRings.push({
        mesh: ringMesh,
        speed: 0.02,
        phase: Math.random() * Math.PI * 2
      });
    });

    // 6. Signature Curved Flight Routes & Photons
    const routeObjects = [];
    const photonParticles = [];

    EDITORIAL_ROUTES.forEach((r, idx) => {
      const orig = AIRPORTS[r.from];
      const dest = AIRPORTS[r.to];
      if (!orig || !dest) return;

      const p1 = projectGeo(orig.lat, orig.lng);
      const p2 = projectGeo(dest.lat, dest.lng);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Parabolic elevation peak
      const zPeak = Math.min(dist * 0.45 + 0.9, 4.8);
      const midPoint = new THREE.Vector3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, zPeak);

      const v1 = new THREE.Vector3(p1.x, p1.y, 0.1);
      const v2 = new THREE.Vector3(p2.x, p2.y, 0.1);

      const curve = new THREE.QuadraticBezierCurve3(v1, midPoint, v2);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const lineMat = new THREE.LineBasicMaterial({
        color: r.color,
        linewidth: 1.5,
        transparent: true,
        opacity: 0.65
      });
      const lineMesh = new THREE.Line(curveGeo, lineMat);
      lineMesh.userData = { route: r };
      worldGroup.add(lineMesh);
      routeObjects.push({ lineMesh, curve, route: r, defaultColor: r.color });

      // In-flight glowing photon packet
      const photonGeo = new THREE.SphereGeometry(0.18, 10, 10);
      const photonMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
      });
      const photon = new THREE.Mesh(photonGeo, photonMat);
      worldGroup.add(photon);

      photonParticles.push({
        mesh: photon,
        curve,
        t: (idx * 0.28) % 1.0,
        speed: 0.0032
      });
    });

    // 7. Exactly Two Active 3D Aircraft Models (DEL ✈ BOM and DEL ✈ BLR)
    const activeAircraft = [];
    const delBom = routeObjects.find((o) => o.route.id === 'DEL-BOM');
    if (delBom) {
      const plane1 = createMiniAirliner(1.1, 0x0284c7);
      worldGroup.add(plane1);
      activeAircraft.push({
        mesh: plane1,
        curve: delBom.curve,
        t: 0.2,
        speed: 0.0036
      });
    }

    const delBlr = routeObjects.find((o) => o.route.id === 'DEL-BLR');
    if (delBlr) {
      const plane2 = createMiniAirliner(1.0, 0xf59e0b);
      worldGroup.add(plane2);
      activeAircraft.push({
        mesh: plane2,
        curve: delBlr.curve,
        t: 0.68,
        speed: 0.003
      });
    }

    // 8. Subtle Parallax on Mouse Movement (Does not rotate India)
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetParallaxX = x * 0.12;
      targetParallaxY = -y * 0.08;

      // Raycasting for airport hover highlighting
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(hubMeshes);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const ap = intersects[0].object.userData.airport;
        setHoveredHub(ap);

        // Highlight connected routes
        routeObjects.forEach((ro) => {
          if (ro.route.from === ap.code || ro.route.to === ap.code) {
            ro.lineMesh.material.color.setHex(0xfbbf24);
            ro.lineMesh.material.opacity = 1.0;
          } else {
            ro.lineMesh.material.color.setHex(0x334155);
            ro.lineMesh.material.opacity = 0.25;
          }
        });
      } else {
        container.style.cursor = 'default';
        setHoveredHub(null);
        routeObjects.forEach((ro) => {
          ro.lineMesh.material.color.setHex(ro.defaultColor);
          ro.lineMesh.material.opacity = 0.65;
        });
      }
    };

    container.addEventListener('mousemove', onMouseMove);

    // 9. Animation Loop (Stable camera, smooth aircraft, non-rotating map)
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera parallax interpolation
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;
      camera.position.x = currentParallaxX * 10;
      camera.position.y = -20 + currentParallaxY * 8;
      camera.lookAt(0, 1.0, 0);

      // Pulsate beacon rings
      pulseRings.forEach((p) => {
        p.phase += p.speed;
        const scale = 1.0 + 0.6 * (Math.sin(p.phase) * 0.5 + 0.5);
        p.mesh.scale.set(scale, scale, 1);
        p.mesh.material.opacity = Math.max(0.1, 0.7 - (scale - 1.0) * 0.6);
      });

      // Move photon packets
      photonParticles.forEach((pt) => {
        pt.t = (pt.t + pt.speed) % 1.0;
        const pos = pt.curve.getPoint(pt.t);
        pt.mesh.position.copy(pos);
      });

      // Move 3D aircraft with pitch and heading
      activeAircraft.forEach((ac) => {
        ac.t = (ac.t + ac.speed) % 1.0;
        const pos = ac.curve.getPoint(ac.t);
        const nextT = Math.min(ac.t + 0.02, 0.999);
        const nextPos = ac.curve.getPoint(nextT);
        ac.mesh.position.copy(pos);
        ac.mesh.lookAt(nextPos);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] lg:h-[580px] select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Subtle Airport Hover Tooltip */}
      {hoveredHub && (
        <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-blue-500/40 rounded-xl px-3.5 py-2.5 shadow-xl backdrop-blur-md text-white pointer-events-none transition-all">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-400 text-sm">{hoveredHub.code}</span>
            <span className="font-semibold text-xs text-slate-200">{hoveredHub.city}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{hoveredHub.name}</div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">
            {hoveredHub.paxM}M Annual Passengers
          </div>
        </div>
      )}

      {/* Signature Scene Watermark */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[11px] font-mono text-slate-400 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
        <span>Live Aviation Airspace · 6 Core Trunk Corridors</span>
      </div>
    </div>
  );
};
