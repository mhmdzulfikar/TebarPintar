import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HARDWARE_COMPONENTS, HardwareSubComponent } from '../data/tebarPintarData';
import { RotateCcw, Layers, Play, Pause, Eye, Compass } from 'lucide-react';

interface Feeder3DViewerProps {
  selectedModel: 'Pro' | 'Lite';
  onSelectModel: (model: 'Pro' | 'Lite') => void;
}

interface PelletParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  age: number;
  maxAge: number;
  active: boolean;
}

export const Feeder3DViewer: React.FC<Feeder3DViewerProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [exploded, setExploded] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeComponent, setActiveComponent] = useState<HardwareSubComponent>(
    HARDWARE_COMPONENTS[0]
  );
  const [webglError, setWebglError] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState({
    doLevel: 6.4,
    phLevel: 7.2,
    waterTemp: 28.6,
    hopperRemainingKg: 18.4,
    spreadRadiusM: 8.5,
  });

  // Mutable refs for animation loop access without re-creating scene
  const stateRef = useRef({
    model: selectedModel,
    exploded,
    dispensing,
    wireframe,
    autoRotate,
    targetSpherical: { radius: 5.0, phi: 1.22, theta: 0.65 },
    currentSpherical: { radius: 5.0, phi: 1.22, theta: 0.65 },
    cameraLookAtTarget: new THREE.Vector3(0, 0.15, 0),
    cameraLookAtCurrent: new THREE.Vector3(0, 0.15, 0),
  });

  useEffect(() => {
    stateRef.current.model = selectedModel;
  }, [selectedModel]);

  useEffect(() => {
    stateRef.current.exploded = exploded;
  }, [exploded]);

  useEffect(() => {
    stateRef.current.dispensing = dispensing;
  }, [dispensing]);

  useEffect(() => {
    stateRef.current.wireframe = wireframe;
  }, [wireframe]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // Simulate realistic live sensor telemetry fluctuations when dispensing or idle
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTelemetry((prev) => {
        const consumed = dispensing ? 0.05 : 0;
        const nextKg = Math.max(
          0.5,
          Number((prev.hopperRemainingKg - consumed).toFixed(2))
        );
        return {
          doLevel: Number((6.3 + Math.sin(Date.now() / 4000) * 0.2).toFixed(2)),
          phLevel: Number((7.2 + Math.cos(Date.now() / 5000) * 0.08).toFixed(2)),
          waterTemp: Number((28.5 + Math.sin(Date.now() / 7000) * 0.2).toFixed(1)),
          hopperRemainingKg: selectedModel === 'Pro' ? nextKg : Math.min(3.8, nextKg),
          spreadRadiusM: selectedModel === 'Pro' ? 8.5 : 2.4,
        };
      });
    }, 900);
    return () => clearInterval(interval);
  }, [dispensing, selectedModel]);

  const handleSelectComponent = (comp: HardwareSubComponent) => {
    setActiveComponent(comp);
    setAutoRotate(false);
    const [x, y, z] = comp.cameraPosition;
    const radius = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.atan2(x, z);
    const phi = Math.acos(Math.min(1, Math.max(-1, y / radius)));
    stateRef.current.targetSpherical = {
      radius: radius * 1.15,
      phi,
      theta,
    };
    stateRef.current.cameraLookAtTarget.set(
      comp.cameraTarget[0],
      comp.cameraTarget[1],
      comp.cameraTarget[2]
    );
  };

  const handleResetCamera = () => {
    setAutoRotate(true);
    stateRef.current.targetSpherical = { radius: 5.0, phi: 1.22, theta: 0.65 };
    stateRef.current.cameraLookAtTarget.set(0, 0.15, 0);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0E1518');
    scene.fog = new THREE.FogExp2('#0E1518', 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);

    // Three-Point Studio Lighting + Pond Water Up-bounce
    const ambientLight = new THREE.AmbientLight('#BFD8E5', 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FFF7E8', 2.4);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#67B7D1', 1.1);
    fillLight.position.set(-6, 3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#10B981', 1.6);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    const waterBounceLight = new THREE.PointLight('#0EA5E9', 1.2, 8);
    waterBounceLight.position.set(0, -1.5, 1.5);
    scene.add(waterBounceLight);

    // Root Assembly
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Materials Catalog
    const materials: THREE.Material[] = [];
    const registerMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };

    const hopperProMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: '#E7E9E4',
        roughness: 0.32,
        metalness: 0.05,
        clearcoat: 0.25,
        clearcoatRoughness: 0.3,
      })
    );

    const hopperLiteMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: '#1C242B',
        roughness: 0.2,
        metalness: 0.2,
        clearcoat: 0.6,
      })
    );

    const tealAccentMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: '#0D6E52',
        roughness: 0.28,
        metalness: 0.25,
      })
    );

    const darkSteelMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: '#252F38',
        roughness: 0.35,
        metalness: 0.82,
      })
    );

    const brushedSteelMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: '#B8C4CC',
        roughness: 0.22,
        metalness: 0.9,
      })
    );

    const solarCellMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: '#0B2545',
        roughness: 0.15,
        metalness: 0.65,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      })
    );

    const amberSensorMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: '#F59E0B',
        roughness: 0.25,
        metalness: 0.4,
        emissive: '#78350F',
        emissiveIntensity: 0.35,
      })
    );

    const pelletMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: '#8C5828',
        roughness: 0.75,
        metalness: 0.05,
      })
    );

    const glassSightMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.38,
        roughness: 0.08,
        metalness: 0.1,
      })
    );

    // 1. HOPPER GROUP (MOD-02)
    const hopperGroup = new THREE.Group();
    rootGroup.add(hopperGroup);

    // Main Cylindrical Body
    const cylinderGeo = new THREE.CylinderGeometry(0.68, 0.68, 1.05, 40);
    const cylinderMesh = new THREE.Mesh(cylinderGeo, hopperProMat);
    cylinderMesh.castShadow = true;
    cylinderMesh.receiveShadow = true;
    cylinderMesh.position.y = 0.55;
    hopperGroup.add(cylinderMesh);

    // Brand Ring Band around Hopper
    const bandGeo = new THREE.CylinderGeometry(0.692, 0.692, 0.16, 40);
    const bandMesh = new THREE.Mesh(bandGeo, tealAccentMat);
    bandMesh.position.y = 0.72;
    hopperGroup.add(bandMesh);

    // Conical Funnel Base (62-degree slope)
    const coneGeo = new THREE.CylinderGeometry(0.68, 0.18, 0.58, 40);
    const coneMesh = new THREE.Mesh(coneGeo, hopperProMat);
    coneMesh.position.y = -0.26;
    coneMesh.castShadow = true;
    hopperGroup.add(coneMesh);

    // Top Airtight Lid + Handle
    const lidGeo = new THREE.CylinderGeometry(0.71, 0.71, 0.08, 40);
    const lidMesh = new THREE.Mesh(lidGeo, darkSteelMat);
    lidMesh.position.y = 1.11;
    hopperGroup.add(lidMesh);

    const lidCapGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.07, 24);
    const lidCapMesh = new THREE.Mesh(lidCapGeo, tealAccentMat);
    lidCapMesh.position.y = 1.18;
    hopperGroup.add(lidCapMesh);

    // Sight Glass Window + Internal Pellet Column
    const sightFrameGeo = new THREE.BoxGeometry(0.12, 0.76, 0.06);
    const sightFrameMesh = new THREE.Mesh(sightFrameGeo, glassSightMat);
    sightFrameMesh.position.set(0, 0.52, 0.67);
    hopperGroup.add(sightFrameMesh);

    const internalPelletGeo = new THREE.BoxGeometry(0.08, 0.62, 0.04);
    const internalPelletMesh = new THREE.Mesh(internalPelletGeo, pelletMat);
    internalPelletMesh.position.set(0, 0.45, 0.66);
    hopperGroup.add(internalPelletMesh);

    // 2. SOLAR MODULE GROUP (MOD-01)
    const solarGroup = new THREE.Group();
    rootGroup.add(solarGroup);

    const mastGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.65, 16);
    const mastMesh = new THREE.Mesh(mastGeo, brushedSteelMat);
    mastMesh.position.set(0, 1.38, -0.38);
    solarGroup.add(mastMesh);

    const solarPanelPivot = new THREE.Group();
    solarPanelPivot.position.set(0, 1.68, -0.32);
    solarPanelPivot.rotation.x = 0.42; // Tilted toward equatorial sun
    solarGroup.add(solarPanelPivot);

    const panelFrameGeo = new THREE.BoxGeometry(1.18, 0.045, 0.78);
    const panelFrameMesh = new THREE.Mesh(panelFrameGeo, brushedSteelMat);
    panelFrameMesh.castShadow = true;
    solarPanelPivot.add(panelFrameMesh);

    const panelCellsGeo = new THREE.BoxGeometry(1.12, 0.015, 0.72);
    const panelCellsMesh = new THREE.Mesh(panelCellsGeo, solarCellMat);
    panelCellsMesh.position.y = 0.022;
    solarPanelPivot.add(panelCellsMesh);

    // Silver busbars on solar panel
    for (let i = -2; i <= 2; i++) {
      const stripGeo = new THREE.BoxGeometry(0.008, 0.018, 0.7);
      const stripMesh = new THREE.Mesh(stripGeo, brushedSteelMat);
      stripMesh.position.set(i * 0.22, 0.024, 0);
      solarPanelPivot.add(stripMesh);
    }

    // 3. AUGER & CENTRIFUGAL SPINNER GROUP (MOD-03)
    const spinnerGroup = new THREE.Group();
    rootGroup.add(spinnerGroup);

    const throatGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.16, 28);
    const throatMesh = new THREE.Mesh(throatGeo, brushedSteelMat);
    throatMesh.position.y = -0.62;
    spinnerGroup.add(throatMesh);

    // Rotating Centrifugal Thrower Disc + 4 Vanes
    const rotorAssembly = new THREE.Group();
    rotorAssembly.position.y = -0.78;
    spinnerGroup.add(rotorAssembly);

    const discGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.025, 32);
    const discMesh = new THREE.Mesh(discGeo, brushedSteelMat);
    rotorAssembly.add(discMesh);

    for (let i = 0; i < 4; i++) {
      const vaneGeo = new THREE.BoxGeometry(0.22, 0.055, 0.018);
      const vaneMesh = new THREE.Mesh(vaneGeo, amberSensorMat);
      const angle = (i * Math.PI) / 2;
      vaneMesh.position.set(Math.cos(angle) * 0.11, 0.03, Math.sin(angle) * 0.11);
      vaneMesh.rotation.y = -angle;
      rotorAssembly.add(vaneMesh);
    }

    // Brushless Motor Core underneath disc
    const motorCanGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.22, 24);
    const motorCanMesh = new THREE.Mesh(motorCanGeo, darkSteelMat);
    motorCanMesh.position.y = -0.94;
    spinnerGroup.add(motorCanMesh);

    // 4. MCU CONTROL & LORA TELEMETRY GROUP (MOD-04)
    const mcuGroup = new THREE.Group();
    rootGroup.add(mcuGroup);

    const mcuBoxGeo = new THREE.BoxGeometry(0.32, 0.44, 0.24);
    const mcuBoxMesh = new THREE.Mesh(mcuBoxGeo, darkSteelMat);
    mcuBoxMesh.position.set(-0.72, 0.42, 0);
    mcuBoxMesh.castShadow = true;
    mcuGroup.add(mcuBoxMesh);

    const oledGeo = new THREE.BoxGeometry(0.02, 0.16, 0.14);
    const oledMat = registerMat(
      new THREE.MeshBasicMaterial({ color: '#10B981' })
    );
    const oledMesh = new THREE.Mesh(oledGeo, oledMat);
    oledMesh.position.set(-0.885, 0.48, 0);
    mcuGroup.add(oledMesh);

    // High-gain LoRa Antenna
    const antennaBaseGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12);
    const antennaBaseMesh = new THREE.Mesh(antennaBaseGeo, brushedSteelMat);
    antennaBaseMesh.position.set(-0.72, 0.68, 0.05);
    mcuGroup.add(antennaBaseMesh);

    const antennaWhipGeo = new THREE.CylinderGeometry(0.01, 0.016, 0.55, 12);
    const antennaWhipMesh = new THREE.Mesh(antennaWhipGeo, darkSteelMat);
    antennaWhipMesh.position.set(-0.72, 0.96, 0.05);
    mcuGroup.add(antennaWhipMesh);

    // 5. SUBMERGED WATER QUALITY PROBE & FRAME GROUP (MOD-05)
    const probeGroup = new THREE.Group();
    rootGroup.add(probeGroup);

    // Tripod Galvanized Legs
    const legAngles = [0.55, 2.59, 4.71];
    legAngles.forEach((ang) => {
      const legGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.55, 16);
      const legMesh = new THREE.Mesh(legGeo, brushedSteelMat);
      legMesh.position.set(
        Math.cos(ang) * 0.66,
        -0.62,
        Math.sin(ang) * 0.66
      );
      legMesh.rotation.z = -Math.cos(ang) * 0.22;
      legMesh.rotation.x = Math.sin(ang) * 0.22;
      probeGroup.add(legMesh);
    });

    // Submerged Titanium DO/pH/Temp Probe + Armored Cable
    const probeBodyGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.46, 24);
    const probeBodyMesh = new THREE.Mesh(probeBodyGeo, brushedSteelMat);
    probeBodyMesh.position.set(0.95, -1.12, 0.35);
    probeGroup.add(probeBodyMesh);

    const probeTipGeo = new THREE.CylinderGeometry(0.055, 0.04, 0.12, 24);
    const probeTipMesh = new THREE.Mesh(probeTipGeo, amberSensorMat);
    probeTipMesh.position.set(0.95, -1.4, 0.35);
    probeGroup.add(probeTipMesh);

    // Curved Cable from MCU to Submerged Probe
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.72, 0.2, 0.05),
      new THREE.Vector3(-0.3, -0.35, 0.45),
      new THREE.Vector3(0.45, -0.65, 0.45),
      new THREE.Vector3(0.95, -0.88, 0.35),
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 28, 0.016, 8, false);
    const cableMesh = new THREE.Mesh(cableGeo, darkSteelMat);
    probeGroup.add(cableMesh);

    // POND WATER SURFACE & RIPPLE RINGS
    const waterGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.08, 64);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: '#083344',
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.72,
      clearcoat: 0.9,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -1.35;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    const rippleRingGeo = new THREE.RingGeometry(0.85, 0.89, 64);
    const rippleRingMat = new THREE.MeshBasicMaterial({
      color: '#38BDF8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const rippleRingMesh = new THREE.Mesh(rippleRingGeo, rippleRingMat);
    rippleRingMesh.rotation.x = -Math.PI / 2;
    rippleRingMesh.position.y = -1.3;
    scene.add(rippleRingMesh);

    // PELLET PARTICLE POOL FOR LIVE FEEDING SIMULATION
    const pelletParticles: PelletParticle[] = [];
    const singlePelletGeo = new THREE.SphereGeometry(0.026, 8, 8);
    for (let i = 0; i < 70; i++) {
      const pMesh = new THREE.Mesh(singlePelletGeo, pelletMat);
      pMesh.visible = false;
      scene.add(pMesh);
      pelletParticles.push({
        mesh: pMesh,
        velocity: new THREE.Vector3(),
        age: 0,
        maxAge: 1.2 + Math.random() * 0.6,
        active: false,
      });
    }

    // Pointer Orbit & Zoom Controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      setAutoRotate(false);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      stateRef.current.targetSpherical.theta -= dx * 0.008;
      stateRef.current.targetSpherical.phi = Math.max(
        0.35,
        Math.min(1.52, stateRef.current.targetSpherical.phi - dy * 0.006)
      );
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.targetSpherical.radius = Math.max(
        3.0,
        Math.min(7.5, stateRef.current.targetSpherical.radius + e.deltaY * 0.003)
      );
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const s = stateRef.current;

      // Apply Wireframe Mode
      materials.forEach((m) => {
        if ('wireframe' in m) {
          (m as THREE.MeshStandardMaterial).wireframe = s.wireframe;
        }
      });

      // Switch between TebarPintar Pro and TebarPintar Lite geometry proportions
      const isLite = s.model === 'Lite';
      cylinderMesh.material = isLite ? hopperLiteMat : hopperProMat;
      coneMesh.material = isLite ? hopperLiteMat : hopperProMat;

      const targetScale = isLite ? 0.68 : 1.0;
      hopperGroup.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.08
      );
      solarGroup.visible = !isLite;
      probeGroup.visible = !isLite;

      // Exploded View Interpolation
      const expOffset = s.exploded ? 1 : 0;
      solarGroup.position.y = THREE.MathUtils.lerp(
        solarGroup.position.y,
        expOffset * 0.65,
        0.08
      );
      lidMesh.position.y = THREE.MathUtils.lerp(
        lidMesh.position.y,
        1.11 + expOffset * 0.38,
        0.08
      );
      lidCapMesh.position.y = THREE.MathUtils.lerp(
        lidCapMesh.position.y,
        1.18 + expOffset * 0.42,
        0.08
      );
      spinnerGroup.position.y = THREE.MathUtils.lerp(
        spinnerGroup.position.y,
        -expOffset * 0.45,
        0.08
      );
      mcuGroup.position.x = THREE.MathUtils.lerp(
        mcuGroup.position.x,
        -expOffset * 0.42,
        0.08
      );
      probeGroup.position.y = THREE.MathUtils.lerp(
        probeGroup.position.y,
        -expOffset * 0.25,
        0.08
      );

      // Rotor Spin & Pellet Dispensing Simulation
      const spinSpeed = s.dispensing ? 18.0 : 0.8;
      rotorAssembly.rotation.y += dt * spinSpeed;

      // Ripple ring animation
      const rippleScale = 1 + ((elapsed * (s.dispensing ? 1.2 : 0.35)) % 1.4);
      rippleRingMesh.scale.set(rippleScale, rippleScale, 1);
      rippleRingMat.opacity = Math.max(
        0,
        (1.4 - (rippleScale - 1)) * (s.dispensing ? 0.45 : 0.2)
      );

      if (s.dispensing) {
        // Spawn active pellets
        for (let i = 0; i < pelletParticles.length; i++) {
          const p = pelletParticles[i];
          if (!p.active && Math.random() < 0.32) {
            p.active = true;
            p.age = 0;
            p.mesh.visible = true;
            const launchAngle = Math.random() * Math.PI * 2;
            const speed = (isLite ? 1.4 : 2.5) + Math.random() * 0.9;
            p.mesh.position.set(
              Math.cos(launchAngle) * 0.2,
              rotorAssembly.position.y + spinnerGroup.position.y,
              Math.sin(launchAngle) * 0.2
            );
            p.velocity.set(
              Math.cos(launchAngle) * speed,
              0.35 + Math.random() * 0.3,
              Math.sin(launchAngle) * speed
            );
            break;
          }
        }
      }

      // Update active pellets physics
      for (let i = 0; i < pelletParticles.length; i++) {
        const p = pelletParticles[i];
        if (!p.active) continue;
        p.age += dt;
        p.velocity.y -= 3.8 * dt; // Gravity
        p.mesh.position.addScaledVector(p.velocity, dt);

        // Hit water plane
        if (p.mesh.position.y <= -1.3) {
          p.mesh.position.y = -1.3;
          p.velocity.set(0, 0, 0);
        }

        if (p.age >= p.maxAge) {
          p.active = false;
          p.mesh.visible = false;
        }
      }

      // Smooth Camera Orbit
      if (s.autoRotate && !isDragging) {
        s.targetSpherical.theta += dt * 0.28;
      }

      s.currentSpherical.radius = THREE.MathUtils.lerp(
        s.currentSpherical.radius,
        s.targetSpherical.radius,
        0.08
      );
      s.currentSpherical.phi = THREE.MathUtils.lerp(
        s.currentSpherical.phi,
        s.targetSpherical.phi,
        0.08
      );
      s.currentSpherical.theta = THREE.MathUtils.lerp(
        s.currentSpherical.theta,
        s.targetSpherical.theta,
        0.08
      );

      s.cameraLookAtCurrent.lerp(s.cameraLookAtTarget, 0.08);

      const r = s.currentSpherical.radius;
      const phi = s.currentSpherical.phi;
      const theta = s.currentSpherical.theta;

      camera.position.set(
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(s.cameraLookAtCurrent);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-[#0E1518] text-[#F3F5F4] rounded-xl border border-white/10 overflow-hidden">
      {/* Top 3D Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#131C20]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-emerald-400">
            INSPEKSI HARDWARE 3D REAL-TIME
          </span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-slate-300">
            Putar 360° dengan klik & geser kursor
          </span>
        </div>

        {/* Interactive Model Switcher */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => onSelectModel('Pro')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedModel === 'Pro'
                ? 'bg-[#0D6E52] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            TebarPintar Pro · Rp 2.500.000
          </button>
          <button
            type="button"
            onClick={() => onSelectModel('Lite')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedModel === 'Lite'
                ? 'bg-[#0D6E52] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            TebarPintar Lite · Rp 500.000
          </button>
        </div>
      </div>

      {/* Main 3D Viewport + Side Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left/Center 8-Col 3D WebGL Canvas */}
        <div className="lg:col-span-8 relative min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
          {webglError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0E1518]">
              <p className="text-base font-semibold text-white mb-2">
                Mode Pratinjau Teknis Hardware TebarPintar {selectedModel}
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                Konteks WebGL sedang dioptimalkan pada perangkat ini. Gunakan panel modul di sebelah kanan untuk melihat rincian spesifikasi dan HPP tiap komponen.
              </p>
            </div>
          ) : (
            <div
              ref={mountRef}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              aria-label={`Visualisasi 3D Interaktif TebarPintar ${selectedModel}`}
            />
          )}

          {/* Top Floating HUD: Live Sensor & Telemetry Overlay */}
          <div className="relative z-10 p-4 sm:p-5 pointer-events-none flex flex-wrap items-start justify-between gap-4">
            <div className="bg-black/55 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 pointer-events-auto">
              <div className="text-xs text-slate-400">
                Varian Aktif · {selectedModel === 'Pro' ? 'Kolam Komersial & Tambak' : 'Koi, Arwana & Aquascape'}
              </div>
              <div className="text-lg font-bold tracking-tight text-white font-display mt-0.5">
                TebarPintar {selectedModel}{' '}
                <span className="font-mono text-sm font-normal text-emerald-400 tabular-nums">
                  {selectedModel === 'Pro' ? '45 Liter / Solar MPPT' : '6 Liter / WiFi Direct'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-300 tabular-nums">
                <span>Sisa Pakan: {liveTelemetry.hopperRemainingKg} kg</span>
                <span aria-hidden="true">·</span>
                <span>Radius Lontar: {liveTelemetry.spreadRadiusM} m</span>
              </div>
            </div>

            {selectedModel === 'Pro' && (
              <div className="bg-black/55 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 pointer-events-auto">
                <div className="text-xs text-slate-400 mb-1.5">
                  Telemetri Probe Air Kolam (MOD-05)
                </div>
                <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
                  <div>
                    <span className="text-slate-400 block">DO (Oksigen)</span>
                    <span className="text-emerald-400 font-semibold text-sm">
                      {liveTelemetry.doLevel} mg/L
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <span className="text-slate-400 block">pH Air</span>
                    <span className="text-white font-semibold text-sm">
                      {liveTelemetry.phLevel}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <span className="text-slate-400 block">Suhu</span>
                    <span className="text-amber-300 font-semibold text-sm">
                      {liveTelemetry.waterTemp}°C
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Floating HUD: Action Controls */}
          <div className="relative z-10 p-4 sm:p-5 pointer-events-none flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setDispensing((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  dispensing
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-[#0D6E52] text-white hover:bg-[#0a5841]'
                }`}
              >
                {dispensing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {dispensing ? 'Hentikan Simulasi Lontar' : 'Uji Lontar Pakan 360°'}
              </button>

              <button
                type="button"
                onClick={() => setExploded((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  exploded
                    ? 'bg-white text-slate-900 border-white'
                    : 'bg-black/55 text-slate-200 border-white/15 hover:border-white/35'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {exploded ? 'Satukan Rakitan' : 'Bedah Komponen (Exploded)'}
              </button>

              <button
                type="button"
                onClick={() => setWireframe((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  wireframe
                    ? 'bg-white text-slate-900 border-white'
                    : 'bg-black/55 text-slate-200 border-white/15 hover:border-white/35'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {wireframe ? 'Mode Solid PBR' : 'Mode Rangka CAD'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetCamera}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-black/55 border border-white/15 rounded-lg hover:text-white hover:border-white/35 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Sudut Kamera
            </button>
          </div>
        </div>

        {/* Right 4-Col Interactive Engineering Module Inspector */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#131C20] p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400">
              DAFTAR SUB-SISTEM PERANGKAT KERAS
            </div>
            <h3 className="text-lg font-bold text-white mt-1 font-display">
              Klik Modul untuk Fokus Kamera 3D
            </h3>

            <div className="mt-4 space-y-2">
              {HARDWARE_COMPONENTS.map((comp) => {
                const isSelected = activeComponent.id === comp.id;
                const isDisabledForLite =
                  selectedModel === 'Lite' && comp.modelApplicability === 'Pro';

                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleSelectComponent(comp)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#0D6E52]/25 border-emerald-500/60 text-white'
                        : 'bg-black/25 border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-emerald-400">{comp.code}</span>
                      <span className="text-slate-400 tabular-nums">
                        Est. BoM: Rp {comp.bomCostIDR.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-sm font-semibold mt-0.5 text-white">
                      {comp.name}
                    </div>
                    {isDisabledForLite && (
                      <div className="text-xs text-amber-300/90 mt-1">
                        Khusus varian TebarPintar Pro (Opsi Upgrade)
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Component Deep Dive Box */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>SPESIFIKASI TEKNIS · {activeComponent.code}</span>
              <Compass className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-base font-semibold text-white mt-1">
              {activeComponent.name}
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {activeComponent.materialSpec}
            </p>
            <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">
              {activeComponent.functionDesc}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">Pertahanan Moat: </span>
              {activeComponent.moatAdvantage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
