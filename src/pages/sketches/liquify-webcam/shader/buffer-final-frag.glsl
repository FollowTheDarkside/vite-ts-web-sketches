uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform bool isCamFront;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 a = texture2D(iChannel1,uv).xy;
    if(isCamFront){
        a.x = 1.0 - a.x;
    }
    gl_FragColor = vec4(texture2D(iChannel0,a).rgb,1.0);
}