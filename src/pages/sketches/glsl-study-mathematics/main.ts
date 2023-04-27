import './style.css'
// @ts-ignore
import * as THREE from 'https://cdn.skypack.dev/three';
// @ts-ignore
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

import vertexSource from './shader/vertex.glsl?raw'
import frag1Bilerp from './shader/frag1-bilerp.glsl?raw'
import frag2PolarRot from './shader/frag2-polar-rot.glsl?raw'
import frag3Binary from './shader/frag3-binary.glsl?raw'
import frag4Vnoise from './shader/frag4-vnoise.glsl?raw'

let windowW = window.innerWidth;
let windowH = window.innerHeight;
let aspRatio = windowW / windowH;
let clock, time;
let renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.PerspectiveCamera, mesh:THREE.Mesh;
let uniforms:any;
let guiObject:any;
let fragTitles = [ 'bilerp', 'polarRot', 'binary', 'vnoise' ];

window.addEventListener('load', init);

function init(){
    // Create GUI
    const gui = new GUI();
    guiObject = {
        sketch: fragTitles[0],
        opacity: 1
    };
    gui.add( guiObject, 'opacity', 0, 1 );
    gui.add( guiObject, 'sketch', fragTitles ).onChange( value => {
        setShaderMaterial(value);
    } );

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
        resolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
    };

    // Create shader material
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexSource,
        fragmentShader: frag1Bilerp,
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
    time.delta = clock.getDelta();
    time.total += time.delta;
    
    uniforms.time.value = time.total;
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

function setShaderMaterial(number){
    const currentMaterial = mesh.material;

    let fragSource = null;
    if(number == fragTitles[0]){
        fragSource = frag1Bilerp;
    }else if(number == fragTitles[1]){
        fragSource = frag2PolarRot;
    }else if(number == fragTitles[2]){
        fragSource = frag3Binary;
    }else if(number == fragTitles[3]){
        fragSource = frag4Vnoise;
    }
    
    const newMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexSource,
        fragmentShader: fragSource,
        //flatShading: true,
        side: THREE.DoubleSide,
    });
    mesh.material = newMaterial;
    currentMaterial.dispose();
}