// @ts-nocheck

import './style.css'
// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { map } from './utils/map'
import { convertSizeTo3dView } from './utils/size-converter'
import { getDistance2d } from './utils/distance';

let windowW = window.innerWidth;
let windowH = window.innerHeight;

// Create renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(windowW, windowH);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(250, 250, 250)");

// Create camera
let aspRatio = windowW / windowH;
let fov = 45;
const camera = new THREE.PerspectiveCamera(fov, aspRatio, 1, 10000);
camera.position.set(0, 0, 50);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

// For window resize
onWindowResize(); // for init
window.addEventListener('resize', onWindowResize);

// Height and width on 3D space
//var heightOnOrigin = (Math.tan(((fov * Math.PI / 180) / 2)) * (camera.position.z - 0) * 2)
//var widthOnOrigin = heightOnOrigin * aspRatio
const {widthOnOrigin, heightOnOrigin} = convertSizeTo3dView(aspRatio, fov, camera.position.z, directionalLight.position.z);
const maxDistanceOnOrigin = getDistance2d(0, 0, widthOnOrigin, heightOnOrigin);
const maxDistance = getDistance2d(0, 0, windowW, windowH);

// Create mesh at mouse position
const boxDefaultSize = 2;
let boxAtMouseScale = 0;
const boxAtMouseScaleMax = 1;
const boxAtMouseScaleMin = 0;
const geometry = new THREE.BoxGeometry(boxDefaultSize, boxDefaultSize, boxDefaultSize);
const material = new THREE.MeshPhongMaterial({color: new THREE.Color("rgb(250, 5, 5)")});
const boxAtMouse = new THREE.Mesh(geometry, material);
scene.add(boxAtMouse);

// Add mouse & touch event
let mouseX = 0;
let mouseY = 0;
let mouseDowned = false;
addEventByMouse();
addEventByTouch();
document.addEventListener("selectstart", e => {
    e.preventDefault();
});

// Create meshes on grid
const grid = {cols: Math.ceil(windowW/80), rows: Math.ceil(windowH/80)}
//console.log("grid:", grid)
const gutterSize = boxDefaultSize;
const meshes = [] as THREE.Mesh[][]
const meshesDefaultPosZ = 0;
const groupMesh = new THREE.Object3D();
for (let row = 0; row < grid.rows; row++) {
    meshes[row] = [] as THREE.Mesh[];
    for (let col = 0; col < grid.cols; col++) {
        const geometry = new THREE.BoxGeometry(boxDefaultSize, boxDefaultSize, boxDefaultSize);
        const material = new THREE.MeshPhongMaterial({color: new THREE.Color("rgb(5, 5, 5)")});
        const mesh = new THREE.Mesh(geometry, material);

        let posX = col + (col * gutterSize);
        let posY = row + (row * gutterSize);
        posX = map(posX, 0, (grid.cols-1) * gutterSize + (grid.cols-1), -1, 1) * (widthOnOrigin * 2 / 5);
        posY = map(posY, 0, (grid.rows-1) * gutterSize + (grid.rows-1), -1, 1) * (heightOnOrigin * 2 / 5);
        
        mesh.position.set(posX, posY, meshesDefaultPosZ);
        meshes[row][col] = mesh;
        groupMesh.add(mesh);
    }
}
//groupMesh.position.set(0, 0, 0);
scene.add(groupMesh);

// Start rendering
tick();

function tick() {
    requestAnimationFrame(tick);

    // Update positions with mouse
    boxAtMouse.position.set(mouseX * widthOnOrigin / 2, mouseY * heightOnOrigin / 2, 0);
    directionalLight.position.set(mouseX * widthOnOrigin / 2, mouseY * heightOnOrigin / 2, 50);

    // Update scale
    if(mouseDowned){
        boxAtMouseScale += (boxAtMouseScale >= boxAtMouseScaleMax) ? 0 : 0.05;
    }else{
        boxAtMouseScale -= (boxAtMouseScale <= boxAtMouseScaleMin) ? 0 : 0.05;
    }
    boxAtMouse.scale.setScalar(boxAtMouseScale);

    // Update meshes position
    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            const mesh = meshes[row][col];
            let dist = getDistance2d(boxAtMouse.position.x, boxAtMouse.position.y, mesh.position.x, mesh.position.y);
            dist = maxDistance * (dist / maxDistanceOnOrigin);
            const posZ = map(dist, 0, maxDistance, -15, 85);
            if(posZ < 0){
                mesh.position.z = posZ*boxAtMouseScale;
            }else{
                mesh.position.z = meshesDefaultPosZ;
            }
        }
    }

    // Rendering
    renderer.render(scene, camera);
}

function addEventByMouse(){
    document.body.addEventListener("mousedown", e => {
        if (e.buttons === 1) { // left mouse button
            mouseDowned = true;
            mouseX = map(e.clientX , 0 , windowW, -1, 1);
            mouseY = map(e.clientY , 0 , windowH, 1, -1);
        }
    });
    document.body.addEventListener("mouseup", e => {
        if (e.buttons === 0) { // no mouse button
            mouseDowned = false;
        }
    });
    document.body.addEventListener("mousemove", e => {
        if (e.buttons === 1) {
            mouseX = map(e.clientX , 0 , windowW, -1, 1);
            mouseY = map(e.clientY , 0 , windowH, 1, -1);
        }
    });
}

function addEventByTouch(){
    document.body.addEventListener("touchstart", e => {
        e.preventDefault();
        mouseDowned = true;
        mouseX = map(e.touches[0].pageX , 0 , windowW, -1, 1);
        mouseY = map(e.touches[0].pageY , 0 , windowH, 1, -1);
    });
    document.body.addEventListener("touchend", e => {
        e.preventDefault();
        mouseDowned = false;
    });
    document.body.addEventListener("touchmove", e => {
        e.preventDefault();
        mouseX = map(e.touches[0].pageX , 0 , windowW, -1, 1);
        mouseY = map(e.touches[0].pageY , 0 , windowH, 1, -1);
    });
}

function onWindowResize() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowW, windowH);

    camera.aspect = windowW / windowH;
    camera.updateProjectionMatrix();
}