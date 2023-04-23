uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 a = texture2D(iChannel1,uv).xy;
    gl_FragColor = vec4(texture2D(iChannel0,a).rgb,1.0);
}