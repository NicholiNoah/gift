import * as THREE from 'three';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the geometry for all tori
const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 48);

// Create an array to hold tori and their materials
const tori = [];
const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xff00ff, 0x00ffff, 0xffff00]; // Added a fifth color
const initialZ = 5; // Initial position closer to the camera
const totalDistance = 2.5; // Total distance for the loop (adjusted for decreased distance)
const baseSpeed = 0.065; // Base speed in units per second
const accelerationFactor = 90000; // Acceleration factor
let scaleFactor = 0.001; // Initial scale factor over time
const scaleFactorIncrease = 0.001; // Exponential increase in scale factor over time
const numTori = colors.length;
const delayFactor = 1.75; // Variable to reduce the delay time
const interval = (totalDistance / numTori) / baseSpeed * 1000 * delayFactor; // Interval in milliseconds
const loopDuration = totalDistance / baseSpeed; // Total duration for one loop
const dissolveDuration = 10; // Duration of the dissolve effect in seconds

// Function to create and add a torus to the scene
function createTorus(color, delay) {
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(0, 0, initialZ);
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
            scene.add(torus);
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
    tori.forEach(({ torus }) => {
        if (torus.added) {
            const elapsed = (currentTime - torus.startTime) / 1000; // Convert to seconds
            const distance = elapsed * baseSpeed;
            const z = initialZ - (distance % totalDistance); // Move away from the camera
            torus.position.z = z;

            // Calculate speed based on distance traveled
            const speed = baseSpeed + accelerationFactor * distance;

            // Calculate scale factor based on exponential increase over time
            scaleFactor += scaleFactorIncrease * delta;
            const scale = 1 - scaleFactor * elapsed;
            torus.scale.set(scale, scale, scale);

            // Calculate opacity based on position in the loop
            const loopPosition = elapsed % loopDuration;
            if (loopPosition >= loopDuration - dissolveDuration) {
                torus.material.opacity = 1 - (loopPosition - (loopDuration - dissolveDuration)) / dissolveDuration;
            } else {
                torus.material.opacity = 1;
            }
        }
    });

    // Render the scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

// Initialize lastTime
let lastTime = performance.now();

// Start the animation loop
animate(lastTime);
