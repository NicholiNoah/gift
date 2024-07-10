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
const baseSpeed = 1; // Base speed in radians per second (adjustable)
const accelerationFactor = 0.1; // Acceleration factor (adjustable)
const dissolveDuration = 10; // Duration of the dissolve effect in seconds

// Function to create and add a torus to the scene
function createTorus(color, delay) {
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(0, 0, 0);
    tori.push({ torus, delay });
}

// Create tori with different colors and equal delays
colors.forEach((color, index) => {
    createTorus(color, index * 1000); // Adjust delay for visibility in testing
});

// Add tori to the scene at the correct time
function addToriToScene(currentTime) {
    tori.forEach(({ torus, delay }) => {
        if (currentTime >= delay && !torus.added) {
            scene.add(torus);
            torus.added = true;
            torus.startTime = currentTime;
        }
    });
}

// Animation function
function animate(currentTime) {
    // Clear the scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Add tori to the scene
    addToriToScene(currentTime);

    // Animate all tori
    tori.forEach(({ torus }) => {
        if (torus.added) {
            const elapsed = (currentTime - torus.startTime) / 1000; // Convert to seconds

            // Calculate speed based on elapsed time
            const speed = baseSpeed + accelerationFactor * elapsed;

            // Calculate position based on time
            const z = Math.sin(elapsed * speed) * 5; // Adjust radius for visibility
            torus.position.z = z;

            // Calculate opacity based on position in the loop
            const loopPosition = elapsed % (2 * Math.PI);
            if (loopPosition >= (2 * Math.PI - dissolveDuration)) {
                torus.material.opacity = 1 - (loopPosition - (2 * Math.PI - dissolveDuration)) / dissolveDuration;
            } else {
                torus.material.opacity = 1;
            }
        }
        scene.add(torus); // Re-add torus to the scene
    });

    // Render the scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

// Start the animation loop
animate(performance.now());
