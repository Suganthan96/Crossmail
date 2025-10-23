'use client';

import { useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Particles from "react-tsparticles";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { loadSlim } from "tsparticles-slim";

export function ParticlesBackground() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {
    // Particle system loaded
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        particles: {
          number: {
            value: 25
          },
          size: {
            value: 3
          },
          color: {
            value: "#ffffff",
          },
          move: {
            enable: true,
            speed: 1,
          },
          opacity: {
            value: 0.2,
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "repulse"
            }
          }
        },
        background: {
          color: {
            value: "white",
          },
        },
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}