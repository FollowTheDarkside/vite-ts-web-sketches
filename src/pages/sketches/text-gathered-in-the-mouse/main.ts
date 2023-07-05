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

let textAtMouse:THREE.Mesh;
let textAtMouseContent = "あなた";
let textAtMouseScale = 0.0;
const textAtMouseScaleMax = 1.0;
const textAtMouseScaleMin = 0.0;

let followTexts = [];
let followTextsContent = ["ぜ","い","き","ん"];
let followTextListNum = 4;
let followTextsSeed = [];
let followTextsPosTarget = [];

let mouseX = 0;
let mouseY = 0;
let mouseDowned = false;

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

    // Load font & Create meshes
    const fontLoader = new FontLoader();
    fontLoader.load("/vite-ts-web-sketches/fonts/CherryBombOne_Regular.json", (font) => {
        console.log("loaded font...");

        // Text at mouse position
        const textGeometry = new TextGeometry(textAtMouseContent, {
            font: font,
            size: 3.0,
            height: 1.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 1.0,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 3,
        })
        textGeometry.center();
        const textMaterial = new THREE.MeshStandardMaterial({color: "rgb(255, 0, 0)", roughness:0.5})
        textAtMouse = new THREE.Mesh(textGeometry, textMaterial)
        textAtMouse.castShadow = true
        textAtMouse.scale.setScalar(textAtMouseScale);
        scene.add(textAtMouse);

        // Texts to gather
        for(let i=0;i<followTextListNum;i++){
            followTexts[i] = [];
            followTextsSeed[i] = [];
            followTextsPosTarget[i] = [];
            let matCol = new THREE.Color( Math.random()*0.75, Math.random()*0.75, Math.random()*0.75)
            for(let j=0;j<followTextsContent.length;j++){
                const textGeo = new TextGeometry(followTextsContent[j], {
                    font: font,
                    size: 2.0,
                    height: 1.5,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.5,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 3,
                })
                textGeo.center();
                const textMat = new THREE.MeshStandardMaterial({color: matCol, roughness:0.5})

                followTexts[i][j] = new THREE.Mesh(textGeo, textMat);
                followTexts[i][j].castShadow = true
                followTexts[i][j].scale.setScalar(1.0);
                scene.add(followTexts[i][j]);

                followTextsSeed[i][j] = Math.random();
                followTextsPosTarget[i][j] = new THREE.Vector3(0, 0, 2);
            }
        }

        // Hide loading text
        let loadingText = document.getElementById('loading-text');
        loadingText.textContent = "LOADED!";
        setTimeout(loadingText.classList.toggle("transparent"), 5000);

        // Start rendering
        tick();
    })
}

function tick() {
    time.delta = clock.getDelta();
    time.total += time.delta;

    // Update text position at mouse
    let mouseDispX = mouseX * sizeOnOrigin.widthOnOrigin / 2;
    let mouseDispY = mouseY * sizeOnOrigin.heightOnOrigin / 2;
    textAtMouse.position.set(mouseDispX, mouseDispY, 0);
    //directionalLight.position.set(mouseX * sizeOnOrigin.widthOnOrigin / 2, mouseY * sizeOnOrigin.heightOnOrigin / 2, 50);
    
    // Update text scale at mouse
    if(mouseDowned){
        textAtMouseScale += (textAtMouseScale >= textAtMouseScaleMax) ? 0 : 0.05;
    }else{
        textAtMouseScale -= (textAtMouseScale <= textAtMouseScaleMin) ? 0 : 0.05;
    }
    textAtMouse.scale.setScalar(textAtMouseScale);

    // Texts gathers while mouse is pressed
    for(let i=0;i<followTextListNum;i++){
        for(let j=0;j<followTextsContent.length;j++){
            if(mouseDowned){
                followTextsPosTarget[i][j].x = mouseDispX;
                followTextsPosTarget[i][j].y = mouseDispY;
            }else{
                followTextsPosTarget[i][j].x = noise.perlin3(i,followTextsSeed[i][j], time.total*0.5) * sizeOnOrigin.widthOnOrigin / 2;
                followTextsPosTarget[i][j].y = noise.perlin3(j+followTextsContent.length,followTextsSeed[i][j], time.total*0.5) * sizeOnOrigin.heightOnOrigin / 2;
            }
            followTexts[i][j].position.lerp(followTextsPosTarget[i][j], 0.05);
        }
    }

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