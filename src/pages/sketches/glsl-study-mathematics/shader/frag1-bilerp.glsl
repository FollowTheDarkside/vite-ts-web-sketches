precision mediump float;

uniform float opacity;
uniform float time;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec3 color = vec3(1.0, 0.0, 0.0);
    vec3[4] col4 = vec3[](
        vec3(1.0,0.0,0.0),
        vec3(1.0,1.0,0.0),
        vec3(1.0,0.0,1.0),
        vec3(0.0,0.0,0.5)
    );
    uv.x *= 2.0;
    int ind = int(uv.x);
    //vec3 col = mix(col3[ind], col3[ind+1], fract(uv.x));
    //vec3 col = mix(mix(col4[0], col4[1], uv.x), mix(col4[2], col4[3], uv.x), uv.y*sin(time));
    float move = 0.5*sin(0.5*time);
    vec3 col = mix(mix(col4[0], col4[1], uv.x+move), mix(col4[2], col4[3], uv.x-move), uv.y+move);

    gl_FragColor = vec4(col, opacity);
}