precision mediump float;

uniform float time;
//uniform float size;

//varying vec2 vUv;
out vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    //vUv.xy = position.xy / vec2(16.0 * 1.5, 9.0 * 1.5) + 0.5;
    vUv = uv;
}