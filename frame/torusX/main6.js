import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 48);
const tori = [];
const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xff00ff];
const initialZ = camera.position.z;
const totalDistance = 5.5;
const speed = 0.15;
const numTori = colors.length;
const interval = (totalDistance / numTori) / speed * 1000;
const loopDuration = totalDistance / speed;
const dissolveDuration = 15;
let lastTime = performance.now();

function createTorus(color, delay) {
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    const torus = new THREE.Mesh(geometry, material);
    torus.position.set(0, 0, initialZ);
    torus.scale.set(1, 1, 1);
    tori.push({ torus, delay });
}

colors.forEach((color, index) => {
    createTorus(color, index * interval);
});

function addToriToScene(currentTime) {
    tori.forEach(({ torus, delay }) => {
        if (currentTime >= delay && !torus.added) {
            scene.add(torus);
            torus.added = true;
            torus.startTime = delay;
        }
    });
}

function animate(currentTime) {
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    addToriToScene(currentTime);

    tori.forEach(({ torus, delay }) => {
        if (torus.added) {
            const elapsed = (currentTime - delay) / 1000;
            const cycleTime = elapsed % loopDuration;
            const z = initialZ - (cycleTime / loopDuration) * totalDistance * speed;
            torus.position.z = z;

            if (cycleTime >= loopDuration - dissolveDuration) {
                torus.material.opacity = 1 - (cycleTime - (loopDuration - dissolveDuration)) / dissolveDuration;
            } else {
                torus.material.opacity = 1;
            }

            const scale = 1 - (cycleTime / loopDuration / 2.5);
            torus.scale.set(scale, scale, scale);

            if (z <= initialZ - totalDistance) {
                torus.scale.set(1, 1, 1);
            }
        }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate(lastTime);
