import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
// Note: For a custom 3D bot model, you can replace the primitive shapes below with a GLTF loader.
// Here, we're building a simple 3D robot using primitives for demonstration.

// Simple Robot Component using primitives
function Robot({ mousePosition }) {
  const groupRef = useRef();
  const headRef = useRef();
  const bodyRef = useRef();
  const armLeftRef = useRef();
  const armRightRef = useRef();
  const legLeftRef = useRef();
  const legRightRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  let blinkTimer = useRef(0);

  // Animation loop for idle bobble
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle rotation based on time for idle animation
      groupRef.current.rotation.y += delta * 0.5;
      
      // Tilt the entire robot based on mouse position (gyro-like effect)
      // Normalize mouse position to -1 to 1
      const tiltX = (mousePosition.x / window.innerWidth) * 2 - 1;
      const tiltY = -(mousePosition.y / window.innerHeight) * 2 + 1;
      
      groupRef.current.rotation.x = tiltY * 0.3; // Pitch
      groupRef.current.rotation.z = tiltX * 0.3; // Roll
      
      // Bobble head slightly
      if (headRef.current) {
        headRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      }
      
      // Swing arms lightly
      if (armLeftRef.current) {
        armLeftRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
      if (armRightRef.current) {
        armRightRef.current.rotation.z = -Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }

      // Blink eyes occasionally by scaling Y
      blinkTimer.current -= delta;
      if (blinkTimer.current <= 0) {
        // Random blink interval between 2s and 6s
        blinkTimer.current = 2 + Math.random() * 4;
      }
      const t = state.clock.elapsedTime;
      const blink = Math.max(0.1, 1 - Math.pow(Math.sin((t % 0.2) * Math.PI * 5), 8));
      if (leftEyeRef.current) leftEyeRef.current.scale.y = blink;
      if (rightEyeRef.current) rightEyeRef.current.scale.y = blink;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1}>
      {/* Body */}
      <mesh ref={bodyRef}>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="white" />
        {/* Eyes */}
        <mesh ref={leftEyeRef} position={[-0.1, 0.1, 0.36]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.1, 0.1, 0.36]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="gray" />
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Arms */}
      <mesh ref={armLeftRef} position={[-0.5, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh ref={armRightRef} position={[0.5, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Legs */}
      <mesh ref={legLeftRef} position={[-0.2, -0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh ref={legRightRef} position={[0.2, -0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Speech Bubble (optional, simplified as a plane) */}
      <mesh position={[0, 0.5, 0.5]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial color="#00FFFF" transparent opacity={0.7} side="double" />
      </mesh>
    </group>
  );
}

// Main Scene Component
export function Scene({ mousePosition }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Robot mousePosition={mousePosition} />
      {/* Optional: Add OrbitControls for manual interaction, but disabled for mouse-only gyro */}
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}

// Login Page Component
function LoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* 3D Canvas - positioned absolutely to overlay or integrate */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <Scene mousePosition={mousePosition} />
      </div>
      
      {/* Login Form - overlay on top */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2em', margin: 0 }}>🤖 AI CRM</h1>
        </div>
        <form>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Username"
              value="User123!"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '1em',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="password"
              placeholder="Password"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '1em',
                marginRight: '10px',
              }}
            />
            <a href="#" style={{ color: '#00FFFF', textDecoration: 'none', fontSize: '0.9em' }}>Forgot Password?</a>
          </div>
          <label style={{ display: 'block', marginBottom: '15px', textAlign: 'left' }}>
            <input type="checkbox" style={{ marginRight: '8px' }} /> Remember Me
          </label>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#00FFFF',
              color: 'white',
              fontSize: '1em',
              cursor: 'pointer',
              marginBottom: '20px',
            }}
          >
            Sign In
          </button>
        </form>
        <p style={{ margin: 0, fontSize: '0.9em' }}>
          New on our platform? <a href="#" style={{ color: '#00FFFF' }}>Create an account</a>
        </p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'white', color: '#667eea' }}>f</button>
          <button style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'white', color: '#667eea' }}>×</button>
          <button style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'white', color: '#667eea' }}>m</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
export { Robot };