import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createApp(baseURL) {
    console.log("Base URL: ", baseURL);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;

    const loader = new GLTFLoader();
    loader.load(`${baseURL}path/to/frame.gltf`, (gltf) => {
        const frame = gltf.scene;
        frame.position.set(0, 0, initialZ);
        frame.scale.set(1, 1, 1);
        frame.rotationSpeedX = (Math.random() - 0.5) * 0.0001;
        frame.rotationSpeedY = (Math.random() - 0.5) * 0.0001;
        scene.add(frame);

        tori.push({ torus: frame, delay });
    });

    const initialZ = camera.position.z - 0;
    const totalDistance = 5.5;
    const speed = 0.15;
    const dissolveDuration = 45;
    const loopDuration = totalDistance / speed;

    const tori = [];

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

                const z = initialZ - (cycleTime / loopDuration) * totalDistance * velocity;
                torus.position.z = z;

                if (cycleTime >= loopDuration - dissolveDuration) {
                    torus.material.opacity = 1 - (cycleTime - (loopDuration - dissolveDuration)) / dissolveDuration;
                } else {
                    torus.material.opacity = 1;
                }

                const scale = 1 - (cycleTime / loopDuration / 2.5);
                torus.scale.set(scale, scale, scale);

                torus.rotation.x += torus.rotationSpeedX;
                torus.rotation.y += torus.rotationSpeedY;

                if (z <= initialZ - totalDistance) {
                    torus.scale.set(1, 1, 1);
                }
            }
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    let lastTime = performance.now();
    animate(lastTime);
}

createApp(import.meta.env.BASE_URL);
