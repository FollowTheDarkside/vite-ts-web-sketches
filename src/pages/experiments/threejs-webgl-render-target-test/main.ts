// @ts-nocheck

import './style.css'
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

import vertexSource from './shader/vertex.glsl?raw'
import fragmentSource from './shader/fragment.glsl?raw'

import postVertexSource from './shader/post-vert.glsl?raw'
import postFragmentSource from './shader/post-frag.glsl?raw'

let windowW = window.innerWidth;
let windowH = window.innerHeight;
let aspRatio = windowW / windowH;
let renderer, scene, camera, light, mesh, uniforms;
let guiObject;

let renderTarget;
let postScene, postMesh, postUniforms;

window.addEventListener('load', init);

function init(){
    // Create GUI
    const gui = new GUI();
    guiObject = {
        opacity: 1,
        postOpacity: 1
    };
    gui.add( guiObject, 'opacity', 0, 1 );
    gui.add( guiObject, 'postOpacity', 0, 1 );

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(windowW, windowH);
    document.body.appendChild(renderer.domElement);

    // Create render target
    renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
        depthBuffer: false,
        stencilBuffer: false,
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping
    });

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(0, 0, 0)");

    // Create camera
    camera = new THREE.PerspectiveCamera(45, windowW / windowH, 1, 10000);
    camera.position.set(0, 0, 20);

    // // Create light
    // light = new THREE.DirectionalLight(0xFFFFFF);
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

    // Create post process
    postScene = new THREE.Scene();
    const postGeometry = new THREE.PlaneGeometry(2,2);
    postUniforms = {
        preTex: {type: "t", value: renderTarget.texture},
        postOpacity: {type: 'f', value: 1.0},
    };
    const postMaterial = new THREE.ShaderMaterial({
        fragmentShader: postFragmentSource,
        vertexShader: postVertexSource,
        uniforms: postUniforms,
    });
    postMesh = new THREE.Mesh(postGeometry, postMaterial);
    postScene.add(postMesh);

    // For window resize
    onWindowResize(); // for init
    window.addEventListener('resize', onWindowResize);

    // Start rendering
    tick();
}

function tick() {
    uniforms.opacity.value = guiObject.opacity;
    postUniforms.postOpacity.value = guiObject.postOpacity;
    
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(postScene, camera);

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