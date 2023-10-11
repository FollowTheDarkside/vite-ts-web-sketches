// @ts-nocheck

import './style.css'
// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@v0.152.0/examples/jsm/loaders/GLTFLoader';

import { map } from './utils/map'
import { convertSizeTo3dView } from './utils/size-converter'
import { getDistance2d } from './utils/distance';

import noise from 'simplenoise';

let windowW = window.innerWidth;
let windowH = window.innerHeight;

let sizeOnOrigin = {widthOnOrigin:0, heightOnOrigin:0};

let clock:THREE.Clock, time:any;
let renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.PerspectiveCamera;

let mouseX = 0;
let mouseY = 0;
let mouseDowned = false;

let circle:THREE.Mesh;
let circleScale = 1.0;
const circleScaleMax = 1.0;
const circleScaleMin = 0.0;
let yourPosZ = 2.5;

let grid;
//let gltfModel:THREE.Group;
let gltfModels;
let lookAtPosition:THREE.Vector3;
let mouseDispPosition:THREE.Vector3;

window.addEventListener('load', init);

function init(){
    // Init clock
    clock = new THREE.Clock();
    clock.start();
    time = {
        total: null,
        delta: null
    };

    // Create renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(windowW, windowH);
    document.body.appendChild(renderer.domElement);

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(25, 25, 25)");

    // Create camera
    let aspRatio = windowW / windowH;
    let fov = 45;
    camera = new THREE.PerspectiveCamera(fov, aspRatio, 1, 10000);
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
    sizeOnOrigin = convertSizeTo3dView(aspRatio, fov, camera.position.z, directionalLight.position.z);
    const maxDistanceOnOrigin = getDistance2d(0, 0, sizeOnOrigin.widthOnOrigin, sizeOnOrigin.heightOnOrigin);
    const maxDistance = getDistance2d(0, 0, windowW, windowH);

    // Add mouse & touch event
    addEventByMouse();
    addEventByTouch();
    document.addEventListener("selectstart", e => {
        e.preventDefault();
    });

    lookAtPosition = new THREE.Vector3(0, 0, 1);
    mouseDispPosition = new THREE.Vector3(0, 0, 1);

    initCircle();
    loadTexture();
}

function tick() {
    time.delta = clock.getDelta();
    time.total += time.delta;

    // Update position at mouse
    let mouseDispX = mouseX * sizeOnOrigin.widthOnOrigin / 2;
    let mouseDispY = mouseY * sizeOnOrigin.heightOnOrigin / 2;
    mouseDispPosition.set(mouseDispX, mouseDispY, yourPosZ);
    
    // Update the direction that models are looking at
    lookAtPosition.lerp(mouseDispPosition, 0.1);
    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            gltfModels[row][col].lookAt(lookAtPosition);
        }
    }
    
    // Update circle at mouse position
    if(mouseDowned){
        circleScale += (circleScale >= circleScaleMax) ? 0 : 0.05;
    }else{
        circleScale -= (circleScale <= circleScaleMin) ? 0 : 0.05;
    }
    circle.scale.setScalar(circleScale);
    circle.position.set(mouseDispX, mouseDispY, yourPosZ);

    // Rendering
    renderer.render(scene, camera);

    requestAnimationFrame(tick);
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

function initCircle(){
    const geometry = new THREE.CircleGeometry(2, 32); 
    const material = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.5,
        color: new THREE.Color("rgb(255, 25, 25)")
    });
    circle = new THREE.Mesh(geometry, material);
    circle.position.set(0, 0, 10);
    scene.add(circle);
}

function loadTexture(){
    console.log("loadTexture...");
    document.getElementById('loading-text').textContent = "Loading GLTF model...";
    
    const loader = new THREE.TextureLoader();
    loader.load(
        // resource URL
        '/vite-ts-web-sketches/LeePerrySmith/Map-COL.jpg',
        // onLoad callback
        function ( texture ) {
            loadGltfModel(texture);
        },
        // onProgress callback currently not supported
        undefined,
        // onError callback
        function ( error ) {
            console.log("Texture:", error);
        }
    );
}

function loadGltfModel(texture){
    //console.log("loadGltfModel...");
    const loader = new GLTFLoader();
    loader.load(
        // resource URL
        "/vite-ts-web-sketches/LeePerrySmith/LeePerrySmith.glb",
        // called when the resource is loaded
        function ( gltf ){
            let gltfModel = gltf.scene;
            gltfModel.name = "model-head";
            gltfModel.scale.set(0.5,0.5,0.5);
            gltfModel.position.set(0,0,0);

            // Set texture and
            gltf.scene.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.material.map = texture;
                }
            });

            //scene.add( gltfModel );

            // Clone model at grid position
            grid = {cols: Math.ceil(windowW/100), rows: Math.ceil(windowH/100)}
            gltfModels = [] as THREE.Mesh[][];
            const meshesDefaultPosZ = 0;
            const gutterSize = 2;
            const groupMesh = new THREE.Object3D();
            for (let row = 0; row < grid.rows; row++) {
                gltfModels[row] = [] as THREE.Mesh[];
                for (let col = 0; col < grid.cols; col++) {
                    let model = gltfModel.clone();
                    let posX = col + (col * gutterSize);
                    let posY = row + (row * gutterSize);
                    posX = map(posX, 0, (grid.cols-1) * gutterSize + (grid.cols-1), -1, 1) * (sizeOnOrigin.widthOnOrigin * 2 / 5);
                    posY = map(posY, 0, (grid.rows-1) * gutterSize + (grid.rows-1), -1, 1) * (sizeOnOrigin.heightOnOrigin * 2 / 5);
                    model.position.set(posX,posY,-yourPosZ);
                    gltfModels[row][col] = model;
                    groupMesh.add(model);
                }
            }
            scene.add(groupMesh);
            console.log("GLTF loaded...");

            // Hide loading text
            let loadingText = document.getElementById('loading-text');
            loadingText.textContent = "LOADED!";
            setTimeout(loadingText.classList.toggle("transparent"), 5000);

            // Start rendering
            tick();
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has error
        function ( error ) {
            console.log("GLTF:", error);
        }
    );
}