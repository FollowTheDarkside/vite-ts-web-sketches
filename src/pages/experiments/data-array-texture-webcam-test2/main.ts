// @ts-nocheck

import './style.css'
import * as THREE from 'https://cdn.skypack.dev/three';

import vertexSource from './shader/vertex.glsl?raw'
import fragmentSource from './shader/fragment.glsl?raw'
import { Uniform } from 'three';

//import { VideoTexture } from 'three';

const width = window.innerWidth;
const height = window.innerHeight;

let webCam: HTMLVideoElement;
let renderer: THREE.WebGLRenderer, scene:  THREE.Scene, camera: THREE.PerspectiveCamera;
let texture: any;
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

    // Create camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 15);
    camera.lookAt(scene.position);

    // Create light
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create mesh
    let upsize = 1.5;
    let geometry = new THREE.PlaneGeometry( 16*upsize, 9*upsize );
    //let geometry = new THREE.PlaneBufferGeometry( 16*upsize, 9*upsize );
    geometry.scale( 0.5, 0.5, 0.5 );

    webCam = document.createElement('video');
    webCam.id = 'webcam';
    webCam.autoplay = true;
    webCam.width    = 640;
    webCam.height   = 480;
    texture = new THREE.VideoTexture( webCam );

    initWebCam();

    // WebGL2RenderingContextを取得
    gl = renderer.getContext();

    const w = 640;
    const h = 480;
    const depth = 30;

    const size = w * h;
    dataArray = new Uint8Array( 4 * size * depth );
    // for ( let i = 0; i < depth; i ++ ) {

    //     const color = new THREE.Color( Math.random(), Math.random(), Math.random() );
    //     const r = Math.floor( color.r * 255 );
    //     const g = Math.floor( color.g * 255 );
    //     const b = Math.floor( color.b * 255 );
    //     // const r = color.r;
    //     // const g = color.g;
    //     // const b = color.b;
    //     //console.log("rgb:",r,g,b)
    
    //     for ( let j = 0; j < size; j ++ ) {
    
    //         const stride = ( i * size + j ) * 4;
    
    //         dataArray[ stride ] = r;
    //         dataArray[ stride + 1 ] = g;
    //         dataArray[ stride + 2 ] = b;
    //         dataArray[ stride + 3 ] = 255;
    
    //     }
    // }
    // for ( let i = 0; i < (4 * size * depth); i ++ ) {
    //     dataArray[ i ] = Math.floor(Math.random() * 255);
    // }
    for (let i = 0; i < dataArray.length; i += 4) {
        dataArray[i] = 255;
        dataArray[i + 1] = 0;
        dataArray[i + 2] = 0;
        dataArray[i + 3] = 255;
    }
    console.log("data",dataArray)
    // DataArrayTextureを作成
    //dataArrayTexture = new THREE.DataArrayTexture(dataArray, 640, 480, THREE.RGBAFormat);
    dataArrayTexture = new THREE.DataArrayTexture( dataArray, width, height, depth );
    dataArrayTexture.format = THREE.RGBAFormat;
    //dataArrayTexture.format = THREE.RedFormat;
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
        vTexture: { value: texture },
        vTextures: { value: dataArrayTexture },
        //vTextures: {value: target.texture},
        arrayIndex: { value: arrayIndex },
    };

    // Create shader material
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        //flatShading: true,
        side: THREE.DoubleSide,
    });
    //material = new THREE.MeshPhongMaterial({color: 0xFF0000});

    let mesh = new THREE.Mesh(geometry, material);
    //this.mesh.rotation.x = Math.PI / 4;
    scene.add(mesh);

    // Start rendering
    tick();

    setTimeout(function() {
       okFlag = true;
    }, 3000);
}

function tick() {
    //if(streamed && okFlag){
    if(1){
        //texture.needsUpdate = true;

        renderer.setRenderTarget(target);
        renderer.render(scene, camera);

        // // レンダーターゲットからピクセルデータを取得
        // const pixels = new Uint8Array(640 * 480 * 4);
        // renderer.readRenderTargetPixels(target, 0, 0, 640, 480, pixels);

        // // フレームを配列に追加
        // // dataArray.set(dataArray.subarray(1), 0);  // 古い要素を削除し、先頭をずらす
        // // dataArray[(4 * 640 * 480 * 30) - 1] = pixels;
        // dataArray.set(dataArray.subarray(640 * 480 * 4), 0);  // 古い要素を削除し、先頭をずらす
        // dataArray.set(pixels, 640 * 480 * 4 * 29); // 新しいフレームを配列に追加
        // dataArrayTexture = new THREE.DataArrayTexture(dataArray, width, height, 30, THREE.RGBAFormat);
        // //dataArrayTexture = new THREE.DataArrayTexture(dataArray, width, height, 30, THREE.RedFormat);

        // // DataArrayTextureを更新
        // dataArrayTexture.format = THREE.RGBAFormat;
        // //dataArrayTexture.format = THREE.RedFormat;

        dataArrayTexture.needsUpdate = true;

        //uniforms.vTextures.value = dataArrayTexture;
        //uniforms.vTextures.value = target.texture;

        // シーンをレンダリングする
        renderer.setRenderTarget(null);
    }

    // if(arrayIndex < 10){
    //     arrayIndex += 5;
    // }else if(arrayIndex > 10){
    //     arrayIndex -= 6;
    // }
    // uniforms.arrayIndex.value = Math.floor(arrayIndex);
    // set the texture unit
    const gl = renderer.getContext();
    const maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const texUnit = Math.min(0, maxTexUnits - 1);
    uniforms.arrayIndex.value = texUnit;
    //console.log("texUnit:",texUnit)

    // Rendering
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}

function initWebCam(){
    console.log("initWebCam...");

    const option = {
        video: true,
        audio: false,
    }

    // Get image from camera
    navigator.mediaDevices.getUserMedia(option)
    .then(stream => {
        console.log("streamed...")
        webCam.srcObject = stream;
        webCam.play();
        streamed = true;
    }).catch(e => {
        alert("ERROR: " + e.message);
        // console.error('ERROR:', e.message);
    });
}