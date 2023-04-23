// @ts-nocheck

import './style.css'
import * as THREE from 'https://cdn.skypack.dev/three';
// import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

// import vertexSource from './shader/vertex.glsl?raw'
import bufferFragmentA from './shader/buffer-a-frag.glsl?raw'
import bufferFragmentB from './shader/buffer-b-frag.glsl?raw'
import bufferFragmentFinal from './shader/buffer-final-frag.glsl?raw'

import {BufferShader, BufferManager} from './buffer'

document.addEventListener('DOMContentLoaded', () => {
    (new App()).start();
});

class App {

    constructor() {

        this.width = 1280;
        this.height = 720;
        this.aspRatio = this.width / this.height;
        this.resolution = new THREE.Vector3(this.width, this.height, window.devicePixelRatio);

        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true // needed for html2canvas
        });
        this.loader = new THREE.TextureLoader();
        this.mousePosition = new THREE.Vector4();
        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.counter = 0;

        this.renderer.setSize(this.width, this.height);
        document.body.appendChild(this.renderer.domElement);

        // Add mouse eevent
        this.renderer.domElement.addEventListener('mousedown', () => {
            this.mousePosition.setZ(1);
            //this.counter = 0;
        });
        this.renderer.domElement.addEventListener('mouseup', () => {
            this.mousePosition.setZ(0);
        });
        this.renderer.domElement.addEventListener('mousemove', event => {
            this.mousePosition.setX(event.clientX);
            this.mousePosition.setY(this.height - event.clientY);
        });

        // Add touch event
        this.renderer.domElement.addEventListener("touchstart", event => {
            event.preventDefault();
            this.mousePosition.setZ(1);
        });
        this.renderer.domElement.addEventListener("touchend", event => {
            event.preventDefault();
            this.mousePosition.setZ(0);
        });
        this.renderer.domElement.addEventListener("touchmove", event => {
            event.preventDefault();
            this.mousePosition.setX(event.clientX);
            this.mousePosition.setY(this.height - event.clientY);
        });

        // Add liquify reset button event
        let resetBtn = document.getElementById('reset-btn');
        resetBtn?.addEventListener('click', () => {
            this.counter = 0;
        });

        // Add camera flip button event
        let flipBtn = document.getElementById('flip-btn');
        flipBtn?.addEventListener('click', () => {
            this.isCamFront = !this.isCamFront;
            this.initWebCam(this.isCamFront, 1280, 720);
        });

        // Add capture button event
        let captureBtn = document.getElementById('capture-btn');
        captureBtn?.addEventListener('click', () => {
            html2canvas(this.renderer.domElement).then((canvas) => {
                const link = document.createElement('a')
                link.href = canvas.toDataURL()
                link.download = `liquify-webcam-out.png`
                link.click()
            })
        });

        this.targetA = new BufferManager(this.renderer, {
            width: this.width,
            height: this.height
        });
        this.targetB = new BufferManager(this.renderer, {
            width: this.width,
            height: this.height
        });
        this.targetC = new BufferManager(this.renderer, {
            width: this.width,
            height: this.height
        });

        this.camStream = null;
        this.isCamFront = true;
        this.webCam = document.createElement('video');
        this.videoTex = new THREE.VideoTexture( this.webCam );

        this.onWindowResize(); // for init
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }


    start() {
        this.bufferA = new BufferShader(bufferFragmentA, {
            iFrame: {
                value: 0
            },
            iResolution: {
                value: this.resolution
            },
            iMouse: {
                value: this.mousePosition
            },
            iChannel0: {
                value: null
            },
            iChannel1: {
                value: null
            }
        });

        this.bufferB = new BufferShader(bufferFragmentB, {
            iFrame: {
                value: 0
            },
            iResolution: {
                value: this.resolution
            },
            iMouse: {
                value: this.mousePosition
            },
            iChannel0: {
                value: null
            }
        });

        this.bufferImage = new BufferShader(bufferFragmentFinal, {
            iResolution: {
                value: this.resolution
            },
            iMouse: {
                value: this.mousePosition
            },
            iChannel0: {
                value: this.videoTex
            },
            iChannel1: {
                value: null
            }
        });

        this.initWebCam(this.isCamFront, 1280, 720);
    }

    initWebCam(isFront, longSide, shortSide){
        console.log("initWebCam...");

        if( this.camStream !== null ){
            this.camStream.getVideoTracks().forEach( (camera) => {
              camera.stop();
            });
        }

        if(this.width > this.height){
            this.webCam.width    = longSide;
            this.webCam.height   = shortSide;
        }else{
            this.webCam.width    = shortSide;
            this.webCam.height   = longSide;
        }
        this.webCam.id = 'webcam';
        this.webCam.autoplay = true;
        

        let facingMode = (isFront) ? "user" : { exact: "environment" };
    
        const option = {
            video: {
                width: this.webCam.width,
                height: this.webCam.height,
                facingMode: facingMode,
            },
            audio: false,
        }
    
        // Get image from camera
        navigator.mediaDevices.getUserMedia(option)
        .then(stream => {
            console.log("streamed...");
            this.camStream = stream;
            this.webCam.srcObject = stream;
            this.webCam.play();

            this.animate();
        }).catch(e => {
            alert("WEBCAM ERROR: " + e.message);
        });
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspRatio = this.width / this.height;

        this.resolution.set(this.width, this.height, window.devicePixelRatio);
    
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
    
        this.orthoCamera.aspect = this.aspRatio;
        this.orthoCamera.updateProjectionMatrix();

        this.counter = 0;
        this.setBufferManagerSize();
    }

    setBufferManagerSize(){
        this.targetA.readBuffer.setSize(this.width, this.height);
        this.targetA.writeBuffer.setSize(this.width, this.height);
        this.targetB.readBuffer.setSize(this.width, this.height);
        this.targetB.writeBuffer.setSize(this.width, this.height);
        this.targetC.readBuffer.setSize(this.width, this.height);
        this.targetC.writeBuffer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => {

            this.bufferA.uniforms['iFrame'].value = this.counter++;

            this.bufferA.uniforms['iChannel0'].value = this.targetA.readBuffer.texture;
            this.bufferA.uniforms['iChannel1'].value = this.targetB.readBuffer.texture;
            this.targetA.render(this.bufferA.scene, this.orthoCamera);

            this.bufferB.uniforms['iChannel0'].value = this.targetB.readBuffer.texture;
            this.targetB.render(this.bufferB.scene, this.orthoCamera);

            this.bufferImage.uniforms['iChannel1'].value = this.targetA.readBuffer.texture;
            this.targetC.render(this.bufferImage.scene, this.orthoCamera, true);

            this.animate();

        });

    }

}