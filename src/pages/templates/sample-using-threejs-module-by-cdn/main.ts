import './style.css'
// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

const width = window.innerWidth;
const height = window.innerHeight;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(0, 0, +1000);

// Create mesh
const geometry = new THREE.BoxGeometry(500, 500, 500);
const material = new THREE.MeshPhongMaterial({color: 0xFF0000});
const box = new THREE.Mesh(geometry, material);
scene.add(box);

// Create light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Start rendering
tick();

function tick() {
    requestAnimationFrame(tick);

    // Roatate box
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    // Rendering
    renderer.render(scene, camera);
}