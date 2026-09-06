import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  INDIA_MAINLAND_COORDS, 
  INDIA_ISLANDS_COORDS, 
  AIRPORTS, 
  EDITORIAL_ROUTES, 
  projectGeo 
} from '../network/indiaGeoData';

// High-fidelity procedural commercial airliner 3D model
function createAirlinerMesh(scale = 1.05, finColor = 0x38bdf8) {
  const plane = new THREE.Group();

  // 1. Aerodynamic Fuselage (main cabin body)
  const bodyGeo = new THREE.CylinderGeometry(0.14 * scale, 0.09 * scale, 1.35 * scale, 12);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.65,
    roughness: 0.25,
    emissive: 0x1e293b,
    emissiveIntensity: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  plane.add(body);

  // 2. Tapered Nose Cone
  const noseGeo = new THREE.ConeGeometry(0.14 * scale, 0.42 * scale, 12);
  noseGeo.rotateX(-Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.position.z = 0.88 * scale;
  plane.add(nose);

  // 3. Swept-back Jet Airliner Wings with Winglets
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.3 * scale);
  wingShape.lineTo(1.25 * scale, -0.42 * scale);
  wingShape.lineTo(1.2 * scale, -0.65 * scale);
  wingShape.lineTo(0, -0.22 * scale);
  wingShape.lineTo(-1.2 * scale, -0.65 * scale);
  wingShape.lineTo(-1.25 * scale, -0.42 * scale);
  wingShape.closePath();

  const wingExtrude = { depth: 0.03 * scale, bevelEnabled: false };
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrude);
  wingGeo.rotateX(Math.PI / 2);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    metalness: 0.6,
    roughness: 0.3
  });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(0, -0.01 * scale, 0.12 * scale);
  plane.add(wing);

  // Wingtip winglets
  [-1.23 * scale, 1.23 * scale].forEach((wx) => {
    const wingletGeo = new THREE.BoxGeometry(0.02 * scale, 0.15 * scale, 0.12 * scale);
    const wingletMat = new THREE.MeshStandardMaterial({ color: finColor, metalness: 0.5 });
    const winglet = new THREE.Mesh(wingletGeo, wingletMat);
    winglet.position.set(wx, 0.07 * scale, -0.52 * scale);
    plane.add(winglet);
  });

  // 4. Twin Underslung Turbofan Jet Engines
  [-0.44 * scale, 0.44 * scale].forEach((engineX) => {
    const engGeo = new THREE.CylinderGeometry(0.075 * scale, 0.065 * scale, 0.34 * scale, 10);
    engGeo.rotateX(Math.PI / 2);
    const engMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2
    });
    const engine = new THREE.Mesh(engGeo, engMat);
    engine.position.set(engineX, -0.11 * scale, 0.14 * scale);
    plane.add(engine);

    // Inner jet glow
    const exhaustGeo = new THREE.CircleGeometry(0.05 * scale, 8);
    const exhaustMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(engineX, -0.11 * scale, -0.04 * scale);
    plane.add(exhaust);
  });

  // 5. Vertical Tail Fin with Carrier Livery
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0, 0.44 * scale);
  finShape.lineTo(-0.22 * scale, 0.44 * scale);
  finShape.lineTo(-0.36 * scale, 0);
  finShape.closePath();

  const finExtrude = { depth: 0.024 * scale, bevelEnabled: false };
  const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrude);
  finGeo.rotateY(Math.PI / 2);
  const finMat = new THREE.MeshStandardMaterial({
    color: finColor,
    roughness: 0.2,
    metalness: 0.5
  });
  const fin = new THREE.Mesh(finGeo, finMat);
  fin.position.set(0.012 * scale, 0.05 * scale, -0.46 * scale);
  plane.add(fin);

  // 6. Horizontal Stabilizers
  const tailWingGeo = new THREE.BoxGeometry(0.64 * scale, 0.02 * scale, 0.18 * scale);
  const tailWing = new THREE.Mesh(tailWingGeo, wingMat);
  tailWing.position.set(0, 0.08 * scale, -0.6 * scale);
  plane.add(tailWing);

  return plane;
}

// Major 6 Hubs for Editorial Focus
const HUBS_TO_RENDER = ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU'];

export const IndiaFlightScene = () => {
  const mountRef = useRef(null);
  const [hoveredHub, setHoveredHub] = useState(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 640;
    let height = container.clientHeight || 560;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup (Perspective FOV = 36 deg for elegant telephoto look)
    const fov = 36;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);

    // 3. High-Performance Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    // 4. Lighting System with Directional Specular
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xe0f2fe, 2.6);
    mainKeyLight.position.set(12, -18, 30);
    scene.add(mainKeyLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    blueRimLight.position.set(-20, 15, 20);
    scene.add(blueRimLight);

    const bottomGlow = new THREE.PointLight(0x0284c7, 2.5, 60);
    bottomGlow.position.set(0, -10, 8);
    scene.add(bottomGlow);

    // 5. World Group (Gentle 3D elevation tilt, strictly non-spinning)
    const worldGroup = new THREE.Group();
    const mapTiltAngle = 0.36; // ~20.6 degrees pitch for perceptible 3D relief
    worldGroup.rotation.x = mapTiltAngle;
    scene.add(worldGroup);

    // 6. Extruded 3D India Mainland Surface
    const mainlandShape = new THREE.Shape();
    INDIA_MAINLAND_COORDS.forEach(([lng, lat], idx) => {
      const p = projectGeo(lat, lng);
      if (idx === 0) mainlandShape.moveTo(p.x, p.y);
      else mainlandShape.lineTo(p.x, p.y);
    });
    mainlandShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.52, // Substantial, elegant 3D relief
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.09,
      bevelSegments: 2
    };

    const mainlandGeo = new THREE.ExtrudeGeometry(mainlandShape, extrudeSettings);
    mainlandGeo.computeBoundingBox();
    const bbox = mainlandGeo.boundingBox;

    // Center offsets
    const centerX = (bbox.max.x + bbox.min.x) / 2;
    const centerY = (bbox.max.y + bbox.min.y) / 2;
    const geoWidth = bbox.max.x - bbox.min.x;
    const geoHeight = bbox.max.y - bbox.min.y;

    // Dual-material for top plate and extruded side walls
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,      // Rich dark slate navy top face
      roughness: 0.6,
      metalness: 0.3,
      emissive: 0x050c18,
      flatShading: false
    });

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x050a14,      // Deep shadow for 3D extrusion wall
      roughness: 0.8,
      metalness: 0.15
    });

    const mainlandMesh = new THREE.Mesh(mainlandGeo, [topMaterial, sideMaterial]);
    worldGroup.add(mainlandMesh);

    // Island Groups (Andaman & Nicobar, Lakshadweep)
    INDIA_ISLANDS_COORDS.forEach((islandRing) => {
      const islandShape = new THREE.Shape();
      islandRing.forEach(([lng, lat], idx) => {
        const p = projectGeo(lat, lng);
        if (idx === 0) islandShape.moveTo(p.x, p.y);
        else islandShape.lineTo(p.x, p.y);
      });
      islandShape.closePath();
      const islandGeo = new THREE.ExtrudeGeometry(islandShape, {
        steps: 1,
        depth: 0.48,
        bevelEnabled: false
      });
      const islandMesh = new THREE.Mesh(islandGeo, topMaterial);
      worldGroup.add(islandMesh);

      // Island boundary ring
      const islandBorderPoints = islandRing.map(([lng, lat]) => {
        const p = projectGeo(lat, lng);
        return new THREE.Vector3(p.x, p.y, 0.54);
      });
      const islandBorderGeo = new THREE.BufferGeometry().setFromPoints(islandBorderPoints);
      const islandBorderMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85
      });
      const islandBorderLine = new THREE.LineLoop(islandBorderGeo, islandBorderMat);
      worldGroup.add(islandBorderLine);
    });

    // 7. Precise Glowing India Coastline & Border (Exact Match to Geographic Dataset)
    const borderPoints = INDIA_MAINLAND_COORDS.map(([lng, lat]) => {
      const p = projectGeo(lat, lng);
      return new THREE.Vector3(p.x, p.y, 0.65); // Elevation sitting right on the bevel crest
    });
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);

    // Crisp high-emissive primary outline
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2.5,
      transparent: true,
      opacity: 0.95
    });
    const borderLine = new THREE.LineLoop(borderGeo, borderMat);
    worldGroup.add(borderLine);

    // Atmospheric halo outline
    const haloMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      linewidth: 4.0,
      transparent: true,
      opacity: 0.4
    });
    const haloLine = new THREE.LineLoop(borderGeo, haloMat);
    haloLine.position.z = 0.58;
    worldGroup.add(haloLine);

    // 8. Airport Nodes (Geographically Correct Hubs with Pins, Radar Rings & Pulse Beacons)
    const hubMeshes = [];
    const pulseRings = [];

    HUBS_TO_RENDER.forEach((code) => {
      const ap = AIRPORTS[code];
      if (!ap) return;

      const pos = projectGeo(ap.lat, ap.lng);
      const hubGroup = new THREE.Group();
      hubGroup.position.set(pos.x, pos.y, 0);

      // Elevated beacon stem pin from extruded surface
      const pinHeight = 0.46;
      const stemGeo = new THREE.CylinderGeometry(0.045, 0.045, pinHeight, 8);
      stemGeo.rotateX(Math.PI / 2);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.7,
        roughness: 0.2
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.z = 0.62 + pinHeight / 2;
      hubGroup.add(stem);

      // Core glowing airport beacon jewel
      const sphereGeo = new THREE.SphereGeometry(0.26, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.4,
        roughness: 0.1
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.z = 0.62 + pinHeight;
      sphere.userData = { airport: ap };
      hubGroup.add(sphere);
      hubMeshes.push(sphere);

      // Expanding Radar Pulse Ring
      const ringGeo = new THREE.RingGeometry(0.46, 0.60, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = 0.65;
      hubGroup.add(ringMesh);

      pulseRings.push({
        mesh: ringMesh,
        speed: 0.024,
        phase: Math.random() * Math.PI * 2
      });

      worldGroup.add(hubGroup);
    });

    // 9. Curved 3D Flight Corridors & Energetic Photon Packets
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

      // Geographically scaled parabolic flight trajectory
      const nodeElevation = 1.08;
      const arcPeakZ = nodeElevation + Math.min(dist * 0.42 + 0.8, 4.6);
      const midPoint = new THREE.Vector3(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2,
        arcPeakZ
      );

      const v1 = new THREE.Vector3(p1.x, p1.y, nodeElevation);
      const v2 = new THREE.Vector3(p2.x, p2.y, nodeElevation);

      const curve = new THREE.QuadraticBezierCurve3(v1, midPoint, v2);
      const curvePoints = curve.getPoints(60);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);

      // Sleek glowing flight corridor line
      const lineMat = new THREE.LineBasicMaterial({
        color: r.color,
        linewidth: 2.2,
        transparent: true,
        opacity: 0.8
      });
      const lineMesh = new THREE.Line(curveGeo, lineMat);
      lineMesh.userData = { route: r };
      worldGroup.add(lineMesh);

      routeObjects.push({ lineMesh, curve, route: r, defaultColor: r.color });

      // Dual In-flight glowing photon packets (Continuous Bidirectional Traffic)
      // 1. Outbound photon (White/Cyan, forward direction)
      const photonOutGeo = new THREE.SphereGeometry(0.16, 12, 12);
      const photonOutMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
      });
      const photonOut = new THREE.Mesh(photonOutGeo, photonOutMat);
      worldGroup.add(photonOut);

      photonParticles.push({
        mesh: photonOut,
        curve,
        t: (idx * 0.28) % 1.0,
        speed: 0.0035,
        direction: 1
      });

      // 2. Inbound return photon (Cyan/Sky glow, return direction)
      const photonInGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const photonInMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9
      });
      const photonIn = new THREE.Mesh(photonInGeo, photonInMat);
      worldGroup.add(photonIn);

      photonParticles.push({
        mesh: photonIn,
        curve,
        t: ((idx * 0.28) + 0.5) % 1.0,
        speed: 0.0032,
        direction: -1
      });
    });

    // 10. Active Bidirectional 3D Commercial Aircraft Fleet
    // Air traffic flows both ways with realistic RVSM vertical airway separation
    const activeAircraft = [];

    // Helper to create a vertically separated return airway corridor
    const createReturnCurve = (baseCurve, altOffset = 0.38, latOffset = -0.15) => {
      const v0 = baseCurve.v0;
      const v2 = baseCurve.v2;
      const mid = baseCurve.v1.clone().add(new THREE.Vector3(latOffset, 0.1, altOffset));
      return new THREE.QuadraticBezierCurve3(v0, mid, v2);
    };

    // Corridor references
    const delBom = routeObjects.find((o) => o.route.id === 'DEL-BOM');
    const delBlr = routeObjects.find((o) => o.route.id === 'DEL-BLR');
    const delCcu = routeObjects.find((o) => o.route.id === 'DEL-CCU');
    const maaDel = routeObjects.find((o) => o.route.id === 'MAA-DEL');

    // 1. DEL ✈ BOM Outbound (IndiGo Cyan livery, Southbound)
    if (delBom) {
      const plane1 = createAirlinerMesh(1.05, 0x0284c7);
      plane1.up.set(0, 0, 1);
      worldGroup.add(plane1);
      activeAircraft.push({
        id: '6E-204-DEL-BOM',
        mesh: plane1,
        curve: delBom.curve,
        t: 0.22,
        speed: 0.0036,
        direction: 1
      });

      // 2. BOM ✈ DEL Inbound Return (Vistara / AI Royal Violet, Northbound)
      const returnCurveBom = createReturnCurve(delBom.curve, 0.38, 0.2);
      const plane2 = createAirlinerMesh(1.02, 0x6366f1);
      plane2.up.set(0, 0, 1);
      worldGroup.add(plane2);
      activeAircraft.push({
        id: 'AI-805-BOM-DEL',
        mesh: plane2,
        curve: returnCurveBom,
        t: 0.78,
        speed: 0.0034,
        direction: -1
      });
    }

    // 3. DEL ✈ BLR Outbound (Air India Saffron Amber livery, Southbound)
    if (delBlr) {
      const plane3 = createAirlinerMesh(1.0, 0xf59e0b);
      plane3.up.set(0, 0, 1);
      worldGroup.add(plane3);
      activeAircraft.push({
        id: 'AI-506-DEL-BLR',
        mesh: plane3,
        curve: delBlr.curve,
        t: 0.62,
        speed: 0.0031,
        direction: 1
      });

      // 4. BLR ✈ DEL Inbound Return (Akasa Sunset Orange livery, Northbound)
      const returnCurveBlr = createReturnCurve(delBlr.curve, 0.38, -0.2);
      const plane4 = createAirlinerMesh(0.98, 0xf97316);
      plane4.up.set(0, 0, 1);
      worldGroup.add(plane4);
      activeAircraft.push({
        id: 'QP-1312-BLR-DEL',
        mesh: plane4,
        curve: returnCurveBlr,
        t: 0.26,
        speed: 0.0030,
        direction: -1
      });
    }

    // 5. CCU ✈ DEL Inbound Return (Teal Emerald livery, Westbound)
    if (delCcu) {
      const plane5 = createAirlinerMesh(0.95, 0x10b981);
      plane5.up.set(0, 0, 1);
      worldGroup.add(plane5);
      activeAircraft.push({
        id: '6E-618-CCU-DEL',
        mesh: plane5,
        curve: delCcu.curve,
        t: 0.54,
        speed: 0.0033,
        direction: -1
      });
    }

    // 6. MAA ✈ DEL Outbound (Crimson Red livery, Northbound from Chennai)
    if (maaDel) {
      const plane6 = createAirlinerMesh(0.94, 0xef4444);
      plane6.up.set(0, 0, 1);
      worldGroup.add(plane6);
      activeAircraft.push({
        id: 'SG-102-MAA-DEL',
        mesh: plane6,
        curve: maaDel.curve,
        t: 0.40,
        speed: 0.0030,
        direction: 1
      });
    }

    // 11. Dynamic Responsive Camera Framing (Guarantees Complete India is NEVER Cropped)
    const updateFraming = () => {
      if (!container) return;
      width = container.clientWidth || 640;
      height = container.clientHeight || 560;

      const aspect = width / height;
      camera.aspect = aspect;

      // Calculate apparent visual dimensions when tilted by mapTiltAngle
      const cosTilt = Math.cos(mapTiltAngle);
      const sinTilt = Math.sin(mapTiltAngle);
      const maxFlightZ = 5.0;

      const apparentHeight = geoHeight * cosTilt + maxFlightZ * sinTilt;
      const apparentWidth = geoWidth;

      // Generous, comfortable padding margin (never cropped on any device)
      const padding = aspect < 1.1 ? 1.36 : 1.30;
      const requiredVerticalFOV = Math.max(
        apparentHeight * padding,
        (apparentWidth * padding) / aspect
      );

      const fovRadians = (fov * Math.PI) / 180;
      const cameraDistance = requiredVerticalFOV / (2 * Math.tan(fovRadians / 2));

      // Position camera south of geometric center, elevated along Z
      const camY = centerY - cameraDistance * sinTilt;
      const camZ = cameraDistance * cosTilt;

      camera.position.set(centerX, camY, camZ);
      camera.lookAt(centerX, centerY + 0.5, 1.2);
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    updateFraming();

    // 12. Subtle Non-Spinning Parallax Interaction on Mouse Movement
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetParallaxX = x * 0.09;
      targetParallaxY = -y * 0.07;

      // Airport Hover Raycasting
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

        // Highlight connected corridors in golden amber
        routeObjects.forEach((ro) => {
          if (ro.route.from === ap.code || ro.route.to === ap.code) {
            ro.lineMesh.material.color.setHex(0xfbbf24);
            ro.lineMesh.material.opacity = 1.0;
          } else {
            ro.lineMesh.material.color.setHex(0x1e293b);
            ro.lineMesh.material.opacity = 0.2;
          }
        });
      } else {
        container.style.cursor = 'default';
        setHoveredHub(null);
        routeObjects.forEach((ro) => {
          ro.lineMesh.material.color.setHex(ro.defaultColor);
          ro.lineMesh.material.opacity = 0.8;
        });
      }
    };

    container.addEventListener('mousemove', onMouseMove);

    // 13. Smooth 60fps Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera parallax interpolation
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;
      
      const aspect = camera.aspect;
      const padding = aspect < 1.1 ? 1.36 : 1.30;
      const apparentHeight = geoHeight * Math.cos(mapTiltAngle) + 5.0 * Math.sin(mapTiltAngle);
      const requiredVerticalFOV = Math.max(apparentHeight * padding, (geoWidth * padding) / aspect);
      const cameraDistance = requiredVerticalFOV / (2 * Math.tan((fov * Math.PI) / 360));

      const baseX = centerX;
      const baseY = centerY - cameraDistance * Math.sin(mapTiltAngle);
      const baseZ = cameraDistance * Math.cos(mapTiltAngle);

      camera.position.x = baseX + currentParallaxX * 6.5;
      camera.position.y = baseY + currentParallaxY * 5.5;
      camera.lookAt(centerX, centerY + 0.5, 1.2);

      // Pulsate radar rings
      pulseRings.forEach((p) => {
        p.phase += p.speed;
        const scale = 1.0 + 0.55 * (Math.sin(p.phase) * 0.5 + 0.5);
        p.mesh.scale.set(scale, scale, 1);
        p.mesh.material.opacity = Math.max(0.12, 0.8 - (scale - 1.0) * 0.85);
      });

      // Move photon packets bidirectionally along routes
      photonParticles.forEach((pt) => {
        if (pt.direction === 1) {
          pt.t = (pt.t + pt.speed) % 1.0;
        } else {
          pt.t -= pt.speed;
          if (pt.t < 0) pt.t += 1.0;
        }
        const pos = pt.curve.getPoint(pt.t);
        pt.mesh.position.copy(pos);
      });

      // Move 3D aircraft bidirectionally with authentic pitch, heading and RVSM separation
      activeAircraft.forEach((ac) => {
        if (ac.direction === 1) {
          ac.t = (ac.t + ac.speed) % 1.0;
          const pos = ac.curve.getPoint(ac.t);
          const nextT = Math.min(ac.t + 0.012, 0.999);
          const nextPos = ac.curve.getPoint(nextT);
          ac.mesh.position.copy(pos);
          ac.mesh.lookAt(nextPos);
        } else {
          ac.t -= ac.speed;
          if (ac.t < 0) ac.t += 1.0;
          const pos = ac.curve.getPoint(ac.t);
          const nextT = Math.max(ac.t - 0.012, 0.001);
          const nextPos = ac.curve.getPoint(nextT);
          ac.mesh.position.copy(pos);
          ac.mesh.lookAt(nextPos);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 14. Responsive Resize Observer & Window Resize
    const resizeObserver = new ResizeObserver(() => {
      updateFraming();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', updateFraming);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', updateFraming);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] sm:h-[580px] lg:h-[620px] select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Geographically Accurate Hub Hover Tooltip */}
      {hoveredHub && (
        <div className="absolute top-4 right-4 z-20 bg-slate-900/95 border border-blue-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-white pointer-events-none transition-all">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-blue-400 text-sm tracking-wider">{hoveredHub.code}</span>
            <span className="font-semibold text-xs text-slate-100">{hoveredHub.city}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{hoveredHub.name}</div>
          <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
            <span className="text-emerald-400">{hoveredHub.activeCorridors} active corridors</span>
            <span className="text-slate-400">{hoveredHub.paxM}M pax/yr</span>
          </div>
        </div>
      )}

      {/* Signature Scene Airspace Watermark & Active Telemetry */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 text-[11px] font-mono text-slate-400 pointer-events-none bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>India Airspace Matrix · Bidirectional Trunk Corridors · Live Telemetry</span>
      </div>

      {/* Geographic Fidelity Indicator */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
          DGCA Survey Datum · 3D Extruded
        </span>
      </div>
    </div>
  );
};
