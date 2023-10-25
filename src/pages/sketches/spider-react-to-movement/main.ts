// @ts-nocheck

import './style.css'
// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'https://unpkg.com/three@0.154.0/examples/jsm/geometries/TextGeometry';
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
let lastMouseX = null;
let lastMouseY = null;
let mouseStopped = true;
let timeoutId;

let mouseDispPosition:THREE.Vector3;

let circle:THREE.Mesh;
let circleScale = 0.0;
const circleScaleMax = 1.0;
const circleScaleMin = 0.0;
let yourPosZ = 2.5;

let spiderPlane:THREE.Mesh;
let spiderPosTarget:THREE.Vector3;

window.addEventListener('load', init);

function init(){
    // Init clock
    clock = new THREE.Clock();
    clock.start();
    time = {
        total: null,
        delta: null
    };

    // Sets the seed for the noise value used to position the text
    noise.seed(Math.random());

    // Create renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(windowW, windowH);
    document.body.appendChild(renderer.domElement);

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(240, 240, 240)");

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

    mouseDispPosition = new THREE.Vector3(0, 0, 1);

    initCircle();
    initSpider();

    //tick();
}

function tick() {
    time.delta = clock.getDelta();
    time.total += time.delta;

    // Update text position at mouse
    let mouseDispX = mouseX * sizeOnOrigin.widthOnOrigin / 2;
    let mouseDispY = mouseY * sizeOnOrigin.heightOnOrigin / 2;
    mouseDispPosition.set(mouseDispX, mouseDispY, yourPosZ);

    // Update spider position
    if(!mouseStopped){
        spiderPosTarget.x = mouseDispX;
        spiderPosTarget.y = mouseDispY;
        spiderPlane.position.lerp(spiderPosTarget, 0.01);
    }else{
        //spiderPosTarget.x = noise.perlin3(0,1, time.total*0.5) * sizeOnOrigin.widthOnOrigin / 2;
        //spiderPosTarget.y = noise.perlin3(0+1,1, time.total*0.5) * sizeOnOrigin.heightOnOrigin / 2;
    }
    //spiderPlane.position.lerp(spiderPosTarget, 0.01);

    // Get vecter to mouse pos
    const direction = new THREE.Vector3();
    direction.subVectors(mouseDispPosition, spiderPlane.position);

    // Calculate the angle between two points and rotate on the z-axis
    const angle = Math.atan2(direction.y, direction.x);
    spiderPlane.rotation.z = angle - Math.PI/2;

    // Update circle at mouse position
    if(!mouseStopped){
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
        mouseX = map(e.clientX , 0 , windowW, -1, 1);
        mouseY = map(e.clientY , 0 , windowH, 1, -1);

        CheckMouseMoving();

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    });
}

function addEventByTouch(){
    document.body.addEventListener("touchstart", e => {
        e.preventDefault();
        mouseDowned = true;
        //mouseX = map(e.touches[0].pageX , 0 , windowW, -1, 1);
        //mouseY = map(e.touches[0].pageY , 0 , windowH, 1, -1);
    });
    document.body.addEventListener("touchend", e => {
        e.preventDefault();
        mouseDowned = false;
    });
    document.body.addEventListener("touchmove", e => {
        e.preventDefault();
        mouseX = map(e.touches[0].pageX , 0 , windowW, -1, 1);
        mouseY = map(e.touches[0].pageY , 0 , windowH, 1, -1);

        CheckMouseMoving();

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    });
}

function CheckMouseMoving(){
    if (lastMouseX !== null && lastMouseY !== null &&
        (lastMouseX !== mouseX || lastMouseY !== mouseY)) {
        mouseStopped = false;

        // If the mouse coordinates do not change for a certain period of time, 
        // the mouse is considered stationary.
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.log('Mouse stop.');
            mouseStopped = true;
        }, 500);
    }
}

function onWindowResize(){
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

function initSpider(){
    console.log("initSpider...");

    const geometry = new THREE.PlaneGeometry(3, 3);
    const loader = new THREE.TextureLoader();
    loader.load(
        // resource URL
        '/vite-ts-web-sketches/image/spider.png',
        // onLoad callback
        function ( texture ) {
            //texture.type = THREE.FloatType;
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
            });
            spiderPlane = new THREE.Mesh(geometry, material);
            spiderPlane.position.x = -sizeOnOrigin.widthOnOrigin*1/3;
            scene.add(spiderPlane);

            spiderPosTarget = new THREE.Vector3(0, 0, yourPosZ);

            // Hide loading text
            let loadingText = document.getElementById('loading-text');
            loadingText.textContent = "LOADED!";
            setTimeout(() => {
                loadingText.classList.toggle("transparent");
            }, 1000);

            // Start animation
            tick();

            
        },
        // onProgress callback currently not supported
        undefined,
        // onError callback
        function ( error ) {
            console.log("Texture:", error);
        }
    );
}