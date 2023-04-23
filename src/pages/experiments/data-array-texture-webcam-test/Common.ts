// @ts-nocheck

import * as THREE from 'https://cdn.skypack.dev/three';

class Common{
    [x: string]: any;
    constructor(){
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.size = {
            windowW: null,
            windowH: null
        };

        this.clock = null;

        this.time = {
            total: null,
            delta: null
        };
    }

    init($canvas:HTMLElement){
        this.setSize();
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45, 
            this.size.windowW / this.size.windowH,
            0.1, 
            10000
        );
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(this.scene.position);

        // Create light
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        this.renderer = new THREE.WebGLRenderer({
            canvas: $canvas,
            precision: 'highp',
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.renderer.setClearColor(0xEAF2F5);
        this.renderer.setSize(this.size.windowW, this.size.windowH);

        this.clock = new THREE.Clock();
        this.clock.start();

        // Target
        // this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        //     minFilter: THREE.LinearFilter,
        //     magFilter: THREE.NearestFilter,
        //     format: THREE.RGBFormat,
        //     type: THREE.UnsignedByteType,
        //     depthBuffer: false
        // });
        // this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        //     type: THREE.UnsignedByteType,
        //     depthBuffer: false,
        //     stencilBuffer: false,
        //     format: THREE.RGBFormat,
        //     minFilter: THREE.NearestFilter,
        //     magFilter: THREE.NearestFilter,
        //     generateMipmaps: false,
        //     depthTexture: false,
        //     array: true, // set to true to enable TEXTURE_2D_ARRAY
        //     layers: 30, // number of layers in the texture array
        // });
        this.renderTarget  = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });
    }

    setSize(){
        this.size = {
            windowW: window.innerWidth,
            windowH: window.innerHeight
        }
    }

    resize(){
        this.setSize();
        this.camera.aspect = this.size.windowW / this.size.windowH;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.size.windowW, this.size.windowH);
    }

    render(){
        this.time.delta = this.clock.getDelta();
        this.time.total += this.delta;

        // 1
        //this.renderer.render(this.scene, this.camera);

        // 2
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);

        // 3
        // for (let i = 0; i < 30; i++) {
        //     this.renderTarget.texture.activeLayer = i;
        //     this.renderer.setRenderTarget(this.renderTarget);
        //     this.renderer.render(this.scene, this.camera);
        // }
        // this.renderer.setRenderTarget(null);
        // this.renderer.render(this.scene, this.camera);
    }
}

export default new Common();