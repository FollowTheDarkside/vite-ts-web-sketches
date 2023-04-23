// @ts-nocheck

import './style.css'
import * as THREE from 'https://cdn.skypack.dev/three';

import vertexSource from './shader/vertex.glsl?raw'
import fragmentSource from './shader/fragment.glsl?raw'


//import { VideoTexture } from 'three';

const width = window.innerWidth;
const height = window.innerHeight;

let renderer: THREE.WebGLRenderer, scene:  THREE.Scene, camera: THREE.PerspectiveCamera, mesh: THREE.Mesh;
let postScene:  THREE.Scene, postCamera: THREE.PerspectiveCamera;
let streamed: boolean;
let okFlag=false;
let uniforms;

let gl, target, frames, pointer;
let dataArray;
let dataArrayTexture:THREE.DataArrayTexture;
let index = 0;
let arrayIndex = 1;

//initWebCam();
window.addEventListener('load', init);

function init(){
    //const canvas = document.getElementById("myCanvas")!;

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    // renderer = new THREE.WebGLRenderer({
    //     canvas: canvas,
    //     precision: 'highp',
    // });

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(0, 250, 0)");
    postScene = new THREE.Scene();
    postScene.background = new THREE.Color("rgb(0, 0, 250)");

    // Create camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);
    postCamera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    postCamera.position.set(0, 0, 15);
    postCamera.lookAt(postScene.position);

    // Create light
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    const postDirectionalLight = new THREE.DirectionalLight(0xFFFFFF);
    postDirectionalLight.position.set(1, 1, 1);
    postScene.add(postDirectionalLight);

    // Create mesh
    let upsize = 1.;
    let geometry = new THREE.PlaneGeometry( 64*upsize, 48*upsize );
    //let geometry = new THREE.PlaneBufferGeometry( 16*upsize, 9*upsize );
    geometry.scale( 1, 1, 1 );
    //geometry.scale( 0.5, 0.5, 0.5 );

    // WebGL2RenderingContextを取得
    gl = renderer.getContext();

    const w = 640;
    const h = 480;
    const depth = 1;

    const size = w * h;
    dataArray = new Uint8Array( 4 * size * depth );
    for ( let i = 0; i < depth; i ++ ) {

        const color = new THREE.Color( Math.random(), Math.random(), Math.random() );
        const r = Math.floor( color.r * 255 );
        const g = Math.floor( color.g * 255 );
        const b = Math.floor( color.b * 255 );
        // const r = color.r;
        // const g = color.g;
        // const b = color.b;
        //console.log("rgb:",r,g,b)
    
        for ( let j = 0; j < size; j ++ ) {
    
            const stride = ( i * size + j ) * 4;
    
            dataArray[ stride ] = r;
            dataArray[ stride + 1 ] = g;
            dataArray[ stride + 2 ] = b;
            dataArray[ stride + 3 ] = 255;
    
        }
    }
    // for ( let i = 0; i < (4 * size * depth); i ++ ) {
    //     //dataArray[ i ] = Math.floor(Math.random() * 255);
    //     //dataArray[i] = Math.floor( map(i, 0, (4 * size * depth), 1, 2555) );
    //     dataArray[i] = i*0.5;
    // }
    // for (let i = 0; i < dataArray.length; i += 4) {
    //     //-----
    //     // dataArray[i] = 255;
    //     // dataArray[i + 1] = 0;
    //     // dataArray[i + 2] = 0;
    //     // dataArray[i + 3] = 255;
    //     //-------
    //     //dataArray[i] = Math.floor( map(i, 0, dataArray.length, 1, 255) );
    //     dataArray[i] = Math.floor(Math.random() * 255);
    //     //dataArray[i] = 25;
    //     dataArray[i + 1] = 0;
    //     dataArray[i + 2] = 0;
    //     dataArray[i + 3] = 255;
    // }
    console.log("dataArray",dataArray)
    // DataArrayTextureを作成
    //dataArrayTexture = new THREE.DataArrayTexture(dataArray, 640, 480, THREE.RGBAFormat);
    dataArrayTexture = new THREE.DataArrayTexture( dataArray, width, height, depth );
    console.log("dataArrayTexture", dataArrayTexture)
    //dataArrayTexture.format = THREE.RGBAFormat;
    dataArrayTexture.format = THREE.RedFormat;
    //dataArrayTexture.format = THREE.RGFormat
    //dataArrayTexture.format = THREE.RGBAIntegerFormat
	dataArrayTexture.needsUpdate = true;

    // WebGLRenderTargetを作成
    // target = new THREE.WebGLRenderTarget( 
    //     640, 480, // レンダーターゲットのサイズ（Webカメラの解像度に合わせる）
    //     {
    //     minFilter: THREE.LinearFilter,
    //     magFilter: THREE.LinearFilter,
    //     format: THREE.RGBAFormat,
    //     type: THREE.UnsignedByteType,
    //     depthBuffer: false,
    //     stencilBuffer: false
    //     }
    // );
    //target = new THREE.WebGLRenderTarget( 640, 480 );
    target = new THREE.WebGLArrayRenderTarget( 640, 480, 30 );
	//target.texture.format = THREE.RedFormat;
    target.texture.format = THREE.RGBAFormat;

    // Set uniforms
    uniforms = {
        time: {
            type: 'f',
            value: 0.0
        },
        //vTextures: { value: dataArray },
        vTextures: { value: dataArrayTexture },
        //vTextures: {value: target.texture},
        arrayIndex: { value: arrayIndex },
    };

    // Create shader material
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        glslVersion: THREE.GLSL3,
        //flatShading: true,
        side: THREE.DoubleSide,
    });
    //material = new THREE.MeshPhongMaterial({color: 0xFF0000});

    mesh = new THREE.Mesh(geometry, material);
    //this.mesh.rotation.x = Math.PI / 4;
    scene.add(mesh);

    // Start rendering
    tick();
}

function tick() {
    // renderer.setRenderTarget(target);
    // renderer.render(postScene, postCamera);
    // dataArrayTexture.needsUpdate = true;
    // renderer.setRenderTarget(null);

    // if(arrayIndex < 10){
    //     arrayIndex += 5;
    // }else if(arrayIndex > 10){
    //     arrayIndex -= 6;
    // }
    // uniforms.arrayIndex.value = Math.floor(arrayIndex);
    // set the texture unit
    // const gl = renderer.getContext();
    // const maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    // const texUnit = Math.min(0, maxTexUnits - 1);
    // uniforms.arrayIndex.value = texUnit;
    //console.log("texUnit:",texUnit)

    //mesh.rotation.y += 0.01;

    // Rendering
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}

function map(value: number, start1: number, stop1: number, start2: number, stop2: number){
    return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
}