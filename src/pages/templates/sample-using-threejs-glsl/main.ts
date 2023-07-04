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

window.addEventListener('load', init);

function init(){
    // Create GUI
    const gui = new GUI();
    guiObject = {
        opacity: 1
    };
    gui.add( guiObject, 'opacity', 0, 1 );

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(windowW, windowH);
    document.body.appendChild(renderer.domElement);

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(0, 0, 0)");

    // Create camera
    camera = new THREE.PerspectiveCamera(45, windowW / windowH, 1, 10000);
    camera.position.set(0, 0, 10);

    // // Create light
    // const light = new THREE.DirectionalLight(0xFFFFFF);
    // light.position.set(1, 1, 1);
    // scene.add(light);

    // Create geometry
    const geometry = new THREE.PlaneGeometry(16, 9);

    // Set uniforms
    uniforms = {
        time: {
            type: 'f',
            value: 0.0
        },
        opacity: {
            type: 'f',
            value: 1.0
        },
    };

    // Create shader material
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        //flatShading: true,
        side: THREE.DoubleSide,
    });
    //const material = new THREE.MeshPhongMaterial({color: 0xFF0000});

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1,1,1);
    scene.add(mesh);

    // For window resize
    onWindowResize(); // for init
    window.addEventListener('resize', onWindowResize);

    // Start rendering
    tick();
}

function tick() {
    uniforms.opacity.value = guiObject.opacity;

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