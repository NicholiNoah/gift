import * as THREE from 'three'; // Assumes three.js is installed as a dependency
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Set camera position

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = false; // Do not allow panning
controls.minDistance = 1; // Minimum zoom distance
controls.maxDistance = 10; // Maximum zoom distance

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5); // Position the light
scene.add(directionalLight);

// GLTFLoader to load the frame model
const loader = new GLTFLoader();

// Create an array to hold frames and their properties
const frames = [];
const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xff00ff];
const initialZ = camera.position.z - 0; // Start at the camera position
const totalDistance = 5.5; // Total distance for the loop
const speed = 0.15; // units per second
const numFrames = colors.length;
const interval = (totalDistance / numFrames) / speed * 1000; // Interval in milliseconds
const loopDuration = totalDistance / speed; // Total duration for one loop
const dissolveDuration = 45; // Duration of the dissolve effect in seconds

// Variable for velocity
const velocity = 0.5; // Adjust as needed

// Function to create and add a frame to the scene
function createFrame(color, delay) {
    loader.load('./frame.gltf', (gltf) => {
        console.log('Model loaded', gltf); // Log model load
        const frame = gltf.scene;
        frame.position.set(0, 0, initialZ); // Set initial position along z-axis
        frame.scale.set(1, 1, 1); // Initial scale

        // Assign moderate random rotation speeds (including negative values)
        frame.rotationSpeedX = (Math.random() - 0.5) * 0.0001;
        frame.rotationSpeedY = (Math.random() - 0.5) * 0.0001;

        frames.push({ frame, delay });
    }, undefined, (error) => {
        console.error('An error occurred loading the model', error);
    });
}

// Create frames with different colors and equal delays
colors.forEach((color, index) => {
    createFrame(color, index * interval);
});

// Add frames to the scene at the correct time
function addFramesToScene(currentTime) {
    frames.forEach(({ frame, delay }) => {
        if (currentTime >= delay && !frame.added) {
            scene.add(frame);
            frame.added = true;
            frame.startTime = delay;
        }
    });
}

// Animation function
function animate(currentTime) {
    // Calculate delta time
    const delta = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Add frames to the scene
    addFramesToScene(currentTime);

    // Animate all frames
    frames.forEach(({ frame, delay }) => {
        if (frame.added) {
            const elapsed = (currentTime - delay) / 1000; // Convert to seconds
            const cycleTime = elapsed % loopDuration; // Time elapsed in one loop cycle

            // Calculate z position based on time and velocity
            const z = initialZ - (cycleTime / loopDuration) * totalDistance * velocity;
            frame.position.z = z;

            // Calculate opacity based on position in the loop
            if (cycleTime >= loopDuration - dissolveDuration) {
                frame.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = true;
                        child.material.opacity = 1 - (cycleTime - (loopDuration - dissolveDuration)) / dissolveDuration;
                    }
                });
            } else {
                frame.traverse((child) => {
                    if (child.isMesh) {
                        child.material.transparent = true;
                        child.material.opacity = 1;
                    }
                });
            }

            // Calculate scale based on position in the loop
            const scale = 1 - (cycleTime / loopDuration / 2.5);
            frame.scale.set(scale, scale, scale);

            // Apply rotation
            frame.rotation.x += frame.rotationSpeedX;
            frame.rotation.y += frame.rotationSpeedY;

            // Reset scale when repositioning
            if (z <= initialZ - totalDistance) {
                frame.scale.set(1, 1, 1);
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
