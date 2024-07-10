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
const geometry = new THREE.TorusGeometry(.5, 0.1, 16, 48);

// Create an array to hold tori and their materials
const tori = [];
const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xff00ff, 0xffff00]; // Added a fifth color
const initialX = -5;
const totalDistance = 10; // Total distance for the loop
const speed = 1; // units per second
const numTori = colors.length;
const interval = (totalDistance / numTori) / speed * 1000; // Interval in milliseconds

// Function to create and add a torus to the scene
function createTorus(color, delay) {
    const material = new THREE.MeshBasicMaterial({ color });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(initialX, 0, 0);
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
            const distance = elapsed * speed;
            const x = initialX + (distance % totalDistance);
            torus.position.x = x;
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
