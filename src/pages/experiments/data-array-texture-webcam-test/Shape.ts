// @ts-nocheck

import * as THREE from 'https://cdn.skypack.dev/three';
import Common from "./Common";

import vertexSource from './shader/vertex.glsl?raw'
import fragmentSource from './shader/fragment.glsl?raw'
import { VideoTexture } from 'three';

export default class Shape{
    //geometry:THREE.BoxGeometry;
    geometry:THREE.PlaneGeometry;
    uniforms!: Object;
    material:THREE.ShaderMaterial;
    //material:THREE.MeshBasicMaterial;
    mesh:THREE.Mesh;
    webCam: any;
    texture: THREE.VideoTexture;
    streamed: boolean;

    
    textures: any;

    constructor(){
        this.streamed = false;
        this.initWebCam();
        //this.init();
    }

    init(){
        // // Create mesh
        // const geo = new THREE.BoxGeometry(5, 5, 5);
        // const mat = new THREE.MeshPhongMaterial({color: 0xFF0000});
        // const box = new THREE.Mesh(geo, mat);
        // Common.scene.add(box);

        // Create box
        //this.initWebCam();
        this.geometry = new THREE.PlaneGeometry( 16, 9 );
        this.geometry.scale( 0.5, 0.5, 0.5 );
        // this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
        // this.mesh = new THREE.Mesh( this.geometry, this.material );
        
        // 過去30フレーム分のテクスチャを保持する配列を作成する
        this.textures = [];
        const numTextures = 30;
        for (let i = 0; i < numTextures; i++) {
            this.textures.push(new THREE.VideoTexture(Common.renderTarget.texture.image));
            this.textures.push(this.texture);
        }
        // for (let i = 0; i < numTextures; i++) {
        //     const videoTexture = new THREE.Texture(Common.renderTarget.texture.image[i]);
        //     videoTexture.format = THREE.RedFormat;
        //     videoTexture.type = THREE.UnsignedByteType;
        //     this.textures.push(videoTexture);
        // }
        // for (let i = 0; i < numTextures; i++) {
        //     const videoTexture = new THREE.CanvasTexture(document.createElement('video'));
        //     this.textures.push(videoTexture);
        // }

        // Set uniforms
        this.uniforms = {
            time: {
                type: 'f',
                value: 0.0
            },
            speed: {
                type: 'f',
                value: 0.5
            },
            scanlineDensity: {
                type: 'f',
                value: 20.0
            },
            tDiffuse: { value: this.texture },
            vTextures: { value: this.textures },
            size: {
                type: 'f',
                value: 1.0
            },
        };

        // Create shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexSource,
            fragmentShader: fragmentSource,
            //flatShading: true,
            side: THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //this.mesh.rotation.x = Math.PI / 4;
        Common.scene.add(this.mesh);
    }

    update(){
        if(this.streamed){
            this.texture.needsUpdate = true;
            //this.mesh.rotation.y += Common.time.delta;
            this.uniforms.time.value += Common.time.delta;

            this.updateTextures();
            //console.log("this.textures",this.textures)
        }
        
    }

    initWebCam(){
        console.log("initWebCam...");
        this.webCam = document.createElement('video');
        this.webCam.id = 'webcam';
        this.webCam.autoplay = true;
        this.webCam.width    = 640;
        this.webCam.height   = 480;

        this.texture = new THREE.VideoTexture( this.webCam );
    
        const option = {
            video: true,
            // video: {
            //     deviceId: "hogehoge",
            //     width: { ideal: 1280 },
            //     height: { ideal: 720 }
            // },
            audio: false,
        }
    
        // Get image from camera
        navigator.mediaDevices.getUserMedia(option)
        .then(stream => {
            this.webCam.srcObject = stream;
            this.streamed = true;
            this.init();
        }).catch(e => {
            alert("ERROR: " + e.message);
            // console.error('ERROR:', e.message);
        });
    }

    // テクスチャのアップデートを処理する関数を作成する
    updateTextures() {
        // テクスチャ配列の最初の要素を削除して、新しいテクスチャを配列の最後に追加する
        //this.textures.shift();
        //this.textures.push(new THREE.VideoTexture(Common.renderTarget.texture.image));
        
        // const videoTexture = new THREE.Texture(Common.renderTarget.texture.image[0]);
        // videoTexture.format = THREE.RedFormat;
        // videoTexture.type = THREE.UnsignedByteType;
        // this.textures.push(videoTexture);

        // // 描画したフレームをテクスチャ配列に追加
        // const latestVideoTexture = new THREE.CanvasTexture(Common.renderTarget.texture.image);
        // this.textures.push(latestVideoTexture);
        // // テクスチャ配列が上限に達したら、最も古いフレームを削除
        // if (this.textures.length > 30) {
        //     const removedTexture = this.textures.shift();
        //     removedTexture.dispose();
        // }
        // for (let i = 0; i < this.textures.length; i++) {
        //     this.textures[i].needsUpdate = true;
        // }
        // // uniforms変数の値を更新
        // this.uniforms.vTextures.value = this.textures;

        // 描画したフレームをテクスチャ配列に追加
        const latestVideoTexture = new THREE.VideoTexture(Common.renderTarget.texture.image);
        this.textures.push(latestVideoTexture);
        // テクスチャ配列が上限に達したら、最も古いフレームを削除
        if (this.textures.length > 30) {
            const removedTexture = this.textures.shift();
            removedTexture.dispose();
        }
        for (let i = 0; i < this.textures.length; i++) {
            this.textures[i].needsUpdate = true;
        }
        // uniforms変数の値を更新
        this.uniforms.vTextures.value = this.textures;
    }
}