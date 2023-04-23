precision mediump float;

uniform float opacity;

void main() {
    vec3 color = vec3(1.0, 0.0, 0.0);
    gl_FragColor = vec4(color, opacity);
}