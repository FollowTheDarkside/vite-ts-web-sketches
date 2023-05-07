precision mediump float;

attribute vec3 color;

uniform float time;
uniform float size;

varying vec3 vColor;
varying float vGray;

void main() {
    // To fragmentShader
    vColor = color;
    vGray = (vColor.x + vColor.y + vColor.z) / 3.0;

    // Set vertex size
    gl_PointSize = size * vGray;

    // Set vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}