// @ts-ignore
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import Common from "./Common";

import vertexSource from './shader/vertex.glsl?raw'
import fragmentSource from './shader/fragment.glsl?raw'

export default class Shape{
    geometry:THREE.BoxGeometry;
    uniforms!: Object;
    material:THREE.ShaderMaterial;
    mesh:THREE.Mesh;

    constructor(){
        this.init();
    }

    init(){
        // // Create mesh
        // const geo = new THREE.BoxGeometry(5, 5, 5);
        // const mat = new THREE.MeshPhongMaterial({color: 0xFF0000});
        // const box = new THREE.Mesh(geo, mat);
        // Common.scene.add(box);

        // Create box
        this.geometry = new THREE.BoxGeometry(5, 5, 5);

        // Set uniforms
        this.uniforms = {
            time: {
                type: 'f',
                value: 0.0
            },
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
            wireframe: true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI / 4;
        Common.scene.add(this.mesh);
    }

    update(){
        this.mesh.rotation.y += Common.time.delta;
    }
}