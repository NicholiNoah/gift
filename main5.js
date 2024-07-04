<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script data-consolejs-channel="b6e9c37b-c445-bb4a-1927-4584488fbdd9" src="https://remotejs.com/agent/agent.js"></script>
    <script async src="https://unpkg.com/es-module-shims@1.8.0/dist/es-module-shims.js"></script>
    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
          "mindar-image-three": "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js"
        }
      }
    </script>
    <script type="module">
      import * as THREE from 'three';
      import { MindARThree } from 'mindar-image-three';

      document.addEventListener('DOMContentLoaded', () => {
        const start = async () => {
          // initialize MindAR
          const mindarThree = new MindARThree({
            container: document.body,
            imageTargetSrc: './assets/textures/unfoldingQR.mind',
          });
          const { renderer, scene, camera } = mindarThree;

          // Create the geometry for all tori
          const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 48);

          // Create an array to hold tori and their materials
          const tori = [];
          const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xff00ff];
          const initialZ = -0.5; // Start position for the tori in AR context
          const totalDistance = 5.5; // Total distance for the loop
          const speed = 0.15; // units per second
          const numTori = colors.length;
          const interval = (totalDistance / numTori) / speed * 1000; // Interval in milliseconds
          const loopDuration = totalDistance / speed; // Total duration for one loop
          const dissolveDuration = 45; // Duration of the dissolve effect in seconds

          // Variable for velocity
          const velocity = 0.5; // Adjust as needed

          // Function to create and add a torus to the scene
          function createTorus(color, delay) {
            const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
            const torus = new THREE.Mesh(geometry, material);
            torus.position.set(0, 0, initialZ); // Set initial position along z-axis
            torus.scale.set(1, 1, 1); // Initial scale
            tori.push({ torus, delay });
          }

          // Create tori with different colors and equal delays
          colors.forEach((color, index) => {
            createTorus(color, index * interval);
          });

          // Add tori to the scene at the correct time
          function addToriToScene(currentTime) {
            tori.forEach(({ torus, delay }) => {
              if (currentTime >= delay && !torus.added) {
                anchor.group.add(torus);
                torus.added = true;
                torus.startTime = delay;
              }
            });
          }

          // Animation function
          function animate(currentTime) {
            // Calculate delta time
            const delta = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;

            // Add tori to the scene
            addToriToScene(currentTime);

            // Animate all tori
            tori.forEach(({ torus, delay }) => {
              if (torus.added) {
                const elapsed = (currentTime - delay) / 1000; // Convert to seconds
                const cycleTime = elapsed % loopDuration; // Time elapsed in one loop cycle

                // Calculate z position based on time and velocity
                const z = initialZ - (cycleTime / loopDuration) * totalDistance * velocity;
                torus.position.z = z;

                // Calculate opacity based on position in the loop
                if (cycleTime >= loopDuration - dissolveDuration) {
                  torus.material.opacity = 1 - (cycleTime - (loopDuration - dissolveDuration)) / dissolveDuration;
                } else {
                  torus.material.opacity = 1;
                }

                // Calculate scale based on position in the loop
                const scale = 1 - (cycleTime / loopDuration / 2.5);
                torus.scale.set(scale, scale, scale);

                // Reset scale when repositioning
                if (z <= initialZ - totalDistance) {
                  torus.scale.set(1, 1, 1);
                }
              }
            });

            // Render the scene
            renderer.render(scene, camera);

            // Request the next frame
            requestAnimationFrame(animate);
          }

          // create anchor
          const anchor = mindarThree.addAnchor(0);

          // Initialize lastTime
          let lastTime = performance.now();

          // Start the animation loop
          animate(lastTime);

          // start AR
          await mindarThree.start();
        };
        start();
      });
    </script>
    <style>
      html, body { position: relative; margin: 0; width: 100%; height: 100%; overflow: hidden; }
    </style>
</head>
<body>
</body>
</html>
