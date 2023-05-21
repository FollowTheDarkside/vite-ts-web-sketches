// @ts-nocheck
import './style.css'

import * as THREE from 'https://unpkg.com/three@v0.152.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@v0.152.0/examples/jsm/loaders/GLTFLoader';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import Stats from 'stats.js';

import { map } from './utils/map'
import { convertSizeTo3dView } from './utils/size-converter'

let windowW = window.innerWidth;
let windowH = window.innerHeight;
let aspRatio = windowW / windowH;
let renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.PerspectiveCamera, mesh:THREE.Mesh;
let uniforms:any;
let guiObject:any;
let stats;

let webCam:HTMLElement, camStream = null, isCamFront = true;
//let videoTex:THREE.VideoTexture;

let clock:THREE.Clock, time:any;

let gltfModel:THREE.Group;

let modelInputSize = {width:640, height:480};
let sizeOnOrigin = {widthOnOrigin:0, heightOnOrigin:0};

let detector, poses;
let nosePos2D = new THREE.Vector3(0, 0, 0);
let nosePos = new THREE.Vector3(0, 0, 0);
let leftFacePos = new THREE.Vector3(-1, 0, 0);
let rightFacePos = new THREE.Vector3(1, 0, 0);
let boxL, boxR, boxNose;

window.addEventListener('load', init);

function init(){
    // Create GUI
    const gui = new GUI();
    guiObject = {
        flip: flipWebCam,
        boxSize: 0.5,
        size: 1,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
    };
    gui.add( guiObject, 'flip' );
    gui.add( guiObject, 'boxSize', 0, 1 );
    const folder = gui.addFolder( 'GLTF' );
    folder.add( guiObject, 'size', 0, 5 );
    folder.add( guiObject, 'scaleX', 0, 2 );
    folder.add( guiObject, 'scaleY', 0, 2 );
    folder.add( guiObject, 'scaleZ', 0, 2 );

    // Init clock
    clock = new THREE.Clock();
    clock.start();
    time = {
        total: null,
        delta: null
    };

    // Init stats
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    // Create renderer
    renderer = new THREE.WebGLRenderer({alpha: true});
    //renderer.setClearColor(0x000000, 0);
    //renderer.setSize(windowW, windowH);
    renderer.setSize(modelInputSize.width, modelInputSize.height);
    document.body.appendChild(renderer.domElement);

    // Create scene
    scene = new THREE.Scene();
    //scene.background = new THREE.Color("rgb(0, 0, 0)");

    // Create camera
    let fov = 45;
    camera = new THREE.PerspectiveCamera(fov, aspRatio, 1, 10000);
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Create light
    const light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    light.position.set(0, 1, 1);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
    scene.add(ambientLight);

    // For window resize
    onWindowResize(); // for init
    window.addEventListener('resize', onWindowResize);

    // Height and width on 3D space
    sizeOnOrigin = convertSizeTo3dView(aspRatio, fov, camera.position.z, light.position.z);

    // Init web camera
    webCam = document.createElement('video');
    //videoTex = new THREE.VideoTexture( webCam );
    initWebCam(isCamFront, 640, 480);

    // Create boxes as mark for face parts
    let boxSize = guiObject.boxSize;
    const geometryL = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const materialL = new THREE.MeshPhongMaterial({color: new THREE.Color("rgb(250, 5, 5)")});
    boxL = new THREE.Mesh(geometryL, materialL);
    scene.add(boxL);
    const geometryR = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const materialR = new THREE.MeshPhongMaterial({color: new THREE.Color("rgb(5, 5, 250)")});
    boxR = new THREE.Mesh(geometryR, materialR);
    scene.add(boxR);
    const geometryN = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const materialN = new THREE.MeshPhongMaterial({color: new THREE.Color("rgb(5, 250, 5)")});
    boxNose = new THREE.Mesh(geometryN, materialN);
    scene.add(boxNose);

    // Load texture & gltf model -> BlazePose
    loadTexture();

    tick();
    //setTimeout(tick, 20000);
}

async function tick() {
    stats.begin();

    time.delta = clock.getDelta();
    time.total += time.delta;

    if(gltfModel){
        gltfModel.scale.set(guiObject.size*guiObject.scaleX, guiObject.size*guiObject.scaleY, guiObject.size*guiObject.scaleZ);
        boxL.scale.set(guiObject.boxSize, guiObject.boxSize, guiObject.boxSize);
        boxR.scale.set(guiObject.boxSize, guiObject.boxSize, guiObject.boxSize);
        boxNose.scale.set(guiObject.boxSize, guiObject.boxSize, guiObject.boxSize);
    }

    if(detector){
        await getPose();
    }

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(tick);
}

function onWindowResize() {
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    //aspRatio = windowW / windowH;
    aspRatio = modelInputSize.width / modelInputSize.height;

    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setSize(windowW, windowH);
    renderer.setSize(modelInputSize.width, modelInputSize.height);

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

    // if(windowW > windowH){
    //     webCam.width    = longSide;
    //     webCam.height   = shortSide;
    // }else{
    //     webCam.width    = shortSide;
    //     webCam.height   = longSide;
    // }
    webCam.id = 'webcam';
    webCam.autoplay = true;
    webCam.muted = true;
    webCam.playsInline = true;
    webCam.width  = modelInputSize.width;
    webCam.height = modelInputSize.height;
    webCam.style.transform="scaleX(-1)";
    document.getElementById('video-sec').appendChild(webCam);

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
    }).catch(e => {
        alert("WEBCAM ERROR: " + e.message);
    });
}

function flipWebCam(){
    isCamFront = !isCamFront;
    initWebCam(isCamFront, 640, 480);
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
            gltfModel = gltf.scene;
            gltfModel.name = "model-head";
            gltfModel.scale.set(0.2, 0.2, 0.2);
            gltfModel.position.set(0,0,0);
            //gltfModel.rotation.set(-Math.PI/2,0,0); 

            // Set texture and
            gltf.scene.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.material.map = texture;
                }
            });

            scene.add( gltfModel );
            console.log("GLTF loaded...");

            initPoseDetectionModel();
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

async function initPoseDetectionModel(){
    let loadingText = document.getElementById('loading-text');
    loadingText.textContent = "Loading Pose Detection Model...";

    tf.setBackend('webgl');
    //tf.setBackend('webgpu');
    console.log("tfjs backend:", tf.getBackend());

    const _model = poseDetection.SupportedModels.BlazePose;
    console.log("Pose Detection Model:", _model);
    const detectorConfig = {
        runtime: 'tfjs', // 'mediapipe', 'tfjs'
        modelType: 'full', // 'lite', 'full', 'heavy'
        enableSmoothing: true,
    };

    if (detector != null) {
        detector.dispose();
    }

    try {
        detector = await poseDetection.createDetector(_model, detectorConfig);
    } catch (error) {
        detector = null;
        alert(error);
    }
    loadingText.textContent = "Loaded.";
    setTimeout(loadingText.classList.toggle("transparent"), 3000);
}

async function getPose(){
    const config = {
        maxPoses: 1,
        flipHorizontal: false,
    }
    poses = await detector.estimatePoses(webCam, config);
    //poses = await detector.estimatePosesGPU(webCam);

    updatePose();
}

function updatePose(){
    if(poses && poses.length > 0){
        //console.log(poses);
        for(var i=0; i<poses.length; i++){
            for(var j=0; j<poses[i].keypoints3D.length; j++){
                //keypoints3D: -1~1
                let posX3D = poses[i].keypoints3D[j].x*-1;
                let posY3D = poses[i].keypoints3D[j].y*-1;
                let posZ3D = poses[i].keypoints3D[j].z*-1;

                //keypoints: 0~modelInputSize
                let posX2D = modelInputSize.width-poses[i].keypoints[j].x;
                let posY2D = modelInputSize.height-poses[i].keypoints[j].y;

                let amp = 10;
                if(j==0){ // 0: nose
                    //console.log("pos3D:", poses[i].keypoints3D[j].x,poses[i].keypoints3D[j].y,poses[i].keypoints3D[j].z)
                    //console.log("pos2D:",posX2D,posY2D)

                    boxNose.position.set(posX3D*amp, posY3D*amp, posZ3D*amp);
                    nosePos.set(posX3D, posY3D, posZ3D);

                    // Match the position of the nose in 2D with the position of the model in 3D space
                    let x = map(posX2D , 0 , modelInputSize.width, -1, 1);
                    let y = map(posY2D , 0 , modelInputSize.height, -1, 1);
                    gltfModel.position.set(x * sizeOnOrigin.widthOnOrigin / 2, y * sizeOnOrigin.heightOnOrigin / 2, 0);
                    nosePos2D.set(x * sizeOnOrigin.widthOnOrigin / 2, y * sizeOnOrigin.heightOnOrigin / 2, 0);
                }else if(j==7){ // 7: left ear
                    boxL.position.set(posX3D*amp, posY3D*amp, posZ3D*amp);
                    leftFacePos.set(posX3D, posY3D, posZ3D);
                }else if(j==8){ // 8: right ear
                    boxR.position.set(posX3D*amp, posY3D*amp, posZ3D*amp);
                    rightFacePos.set(posX3D, posY3D, posZ3D);

                    // Set gltf direction
                    const midpoint = new THREE.Vector3();
                    midpoint.addVectors(leftFacePos, rightFacePos).multiplyScalar(0.5);
                    let vecNose = nosePos.clone().sub(midpoint);
                    vecNose.add(nosePos2D);
                    //vecNose.normalize();
                    gltfModel.lookAt(vecNose);
                    //console.log("vec:",vecNose)
                }
            }
        }
    }
}