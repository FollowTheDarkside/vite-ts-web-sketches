// @ts-nocheck

import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import vertexSource from './shader/vertex.glsl?raw';

export class BufferShader {

    constructor(fragmentShader, uniforms = {}) {

        this.uniforms = uniforms;
        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexSource,
            uniforms: uniforms
        });
        this.scene = new THREE.Scene();
        this.scene.add(
            new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material)
        );
    }

}

export class BufferManager {


    constructor(renderer, size) {

        this.renderer = renderer;

        this.readBuffer = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });

        this.writeBuffer = this.readBuffer.clone();

    }

    swap() {
        const temp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = temp;
    }

    render(scene, camera, toScreen = false) {
        if (toScreen) {
            this.renderer.render(scene, camera);
        } else {
            this.renderer.setRenderTarget(this.writeBuffer);
            this.renderer.clear();
            this.renderer.render(scene, camera)
            this.renderer.setRenderTarget(null);
        }
        this.swap();
    }

}