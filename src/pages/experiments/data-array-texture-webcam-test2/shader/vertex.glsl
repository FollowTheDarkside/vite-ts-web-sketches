precision mediump float;

uniform float time;
//uniform float size;

varying vec2 vUv;

void main() {
    vUv = uv;

    // vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    // vec4 mvPosition =  viewMatrix * worldPosition;
    // gl_Position = projectionMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    //gl_Position = vec4(position, 1.0);
}