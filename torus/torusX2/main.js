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
const totalDistance = 3.5; // Total distance for the loop (adjusted for decreased distance)
const baseSpeed = 0.075; // Base speed in units per second
const accelerationFactor = 9000000; // Acceleration factor
const numTori = colors.length;
const delayFactor = 1.75; // Variable to reduce the delay time
const interval = (totalDistance / numTori) / baseSpeed * 1000 * delayFactor; // Interval in milliseconds
const loopDuration = totalDistance / baseSpeed; // Total duration for one loop
const dissolveDuration = 10; // Duration of the dissolve effect in seconds
const secondaryDelay = 15; // Extra delay before each torus resets position to origin, in seconds

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
            const totalDistanceWithDelay = totalDistance + secondaryDelay * baseSpeed; // Include secondary delay
            const z = initialZ - (distance % totalDistanceWithDelay); // Move away from the camera
            torus.position.z = z;

            // Calculate speed based on distance traveled
            const speed = baseSpeed + accelerationFactor * distance;

            // Calculate opacity based on position in the loop
            const loopPosition = elapsed % loopDuration;
            if (loopPosition >= loopDuration - dissolveDuration) {
                torus.material.opacity = 1 - (loopPosition - (loopDuration - dissolveDuration)) / dissolveDuration;
            } else if (loopPosition < dissolveDuration) {
                // Reset opacity when the torus resets its position
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
