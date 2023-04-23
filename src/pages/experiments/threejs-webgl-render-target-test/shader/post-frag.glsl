precision mediump float;

varying vec2 vUv;
uniform sampler2D preTex;
uniform float postOpacity;

void main() {
    vec4 color = texture2D(preTex, vUv.st) * postOpacity;
    gl_FragColor = vec4(color);
}