// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

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
            canvas: $canvas
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.renderer.setClearColor(0xEAF2F5);
        this.renderer.setSize(this.size.windowW, this.size.windowH);

        this.clock = new THREE.Clock();
        this.clock.start();
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

        this.renderer.render(this.scene, this.camera);
    }
}

export default new Common();