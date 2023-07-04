// @ts-nocheck
import './style.css'
// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
// @ts-ignore
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

import vertexSource from './shader/vertex.glsl?raw'
import fragmentSource from './shader/fragment.glsl?raw'

let windowW = window.innerWidth;
let windowH = window.innerHeight;
let aspRatio = windowW / windowH;
let renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.PerspectiveCamera, mesh:THREE.Mesh;
let uniforms:any;
let guiObject:any;

let webCam:HTMLElement, camStream = null, isCamFront = true;
//let videoTex:THREE.VideoTexture;

let particles:THREE.Points;

let clock:THREE.Clock, time:any;

window.addEventListener('load', init);

function init(){
    // Create GUI
    const gui = new GUI();
    guiObject = {
        drawingInv: false,
        size: 5,
        depthZ: 10,
        drawingTh: 0.5,
        opacity: 1,
        flip: flipWebCam,
    };
    gui.add( guiObject, 'drawingInv');
    gui.add( guiObject, 'size', 0, 10 );
    gui.add( guiObject, 'depthZ', -10, 10 );
    gui.add( guiObject, 'drawingTh', 0, 1 );
    gui.add( guiObject, 'opacity', 0, 1 );
    gui.add( guiObject, 'flip');

    clock = new THREE.Clock();
    clock.start();
    time = {
        total: null,
        delta: null
    };

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(windowW, windowH);
    document.body.appendChild(renderer.domElement);

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(0, 0, 0)");

    // Create camera
    camera = new THREE.PerspectiveCamera(45, windowW / windowH, 1, 10000);
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // // Create light
    // const light = new THREE.DirectionalLight(0xFFFFFF);
    // light.position.set(1, 1, 1);
    // scene.add(light);

    // For window resize
    onWindowResize(); // for init
    window.addEventListener('resize', onWindowResize);

    // Init web camera
    webCam = document.createElement('video');
    //videoTex = new THREE.VideoTexture( webCam );
    initWebCam(isCamFront, 640, 480);

    tick();
}

function tick() {
    time.delta = clock.getDelta();
    time.total += time.delta;
    
    if(particles){
        particles.material.uniforms.time.value = time.total;
        particles.material.uniforms.size.value = guiObject.size;
        particles.material.uniforms.drawingThreshold.value = guiObject.drawingTh;
        particles.material.uniforms.opacity.value = guiObject.opacity;
        particles.material.uniforms.drawingInvert.value = guiObject.drawingInv;
        drawParticles();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(tick);
}

function onWindowResize() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    aspRatio = windowW / windowH;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowW, windowH);

    camera.aspect = aspRatio;
    camera.updateProjectionMatrix();
}

function initWebCam(isFront, longSide, shortSide){
    console.log("initWebCam...");

    if( camStream !== null ){
        camStream.getVideoTracks().forEach( (camera) => {
          camera.stop();
        });
    }

    if(windowW > windowH){
        webCam.width    = longSide;
        webCam.height   = shortSide;
    }else{
        webCam.width    = shortSide;
        webCam.height   = longSide;
    }
    webCam.id = 'webcam';
    webCam.autoplay = true;
    webCam.muted = true;
    webCam.playsInline = true;

    let facingMode = (isFront) ? "user" : { exact: "environment" };

    const option = {
        video: {
            width: { min:0, max:webCam.width },
            height: { min:0, max:webCam.height },
            aspectRatio: webCam.width/webCam.height,
            facingMode: facingMode,
        },
        audio: false,
    }

    // Get image from camera
    navigator.mediaDevices.getUserMedia(option)
    .then(stream => {
        console.log("streamed...");
        camStream = stream;
        webCam.srcObject = stream;
        webCam.play();

        createParticles();
    }).catch(e => {
        alert("WEBCAM ERROR: " + e.message);
    });
}

function flipWebCam(){
    isCamFront = !isCamFront;
    initWebCam(isCamFront, 640, 480);
}

function getImageData(image){

    const w = image.width;
    const h = image.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    if(!isCamFront){
        // Invert image
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);

    return imageData
}

function createParticles(){
    console.log("createParticles...");

    if(particles){
        scene.remove(particles);
        particles.material.dispose();
        particles.geometry.dispose();
    }

    const imageData = getImageData(webCam);

    const geometry = new THREE.BufferGeometry();
    const vertices_base = [];
    const colors_base = [];

    const width = imageData.width;
    const height = imageData.height;

    // Set particle info
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const posX = 0.03*(-x + width / 2);
            const posY = 0.03*(-y + height / 2); //
            const posZ = 0;//0.03*(y - height / 2);
            vertices_base.push(posX, posY, posZ);

            const r = 1.0;
            const g = 1.0;
            const b = 1.0;
            colors_base.push(r, g, b);
        }
    }
    const vertices = new Float32Array(vertices_base);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const colors = new Float32Array(colors_base);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Set shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: 'f',
                value: 0.0
            },
            size: {
                type: 'f',
                value: 5.0
            },
            drawingThreshold: {
                type: 'f',
                value: 0.5
            },
            opacity: {
                type: 'f',
                value: 1.0
            },
            drawingInvert: {
                type: 'b',
                value: false
            },
        },
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function drawParticles(){
    // Update particle info
    const imageData = getImageData(webCam);
    const length = particles.geometry.attributes.position.count;
    for (let i = 0; i < length; i++) {
        const index = i * 4;
        const r = imageData.data[index]/255;
        const g = imageData.data[index+1]/255;
        const b = imageData.data[index+2]/255;
        const gray = (r+g+b) / 3;

        particles.geometry.attributes.position.setZ( i , gray*guiObject.depthZ);
        particles.geometry.attributes.color.setX( i , r);
        particles.geometry.attributes.color.setY( i , g);
        particles.geometry.attributes.color.setZ( i , b);
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
}