precision mediump float;

uniform float time;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vec4 mvPosition =  viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    // gl_PointSize = size;
}