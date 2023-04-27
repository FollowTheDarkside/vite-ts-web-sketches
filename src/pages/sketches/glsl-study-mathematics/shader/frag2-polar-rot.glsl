precision mediump float;
const float PI = 3.1415926;

uniform float opacity;
uniform float time;
varying vec2 vUv;

float atan2(float x, float y){
    if(x == 0.0){
        return sign(y) * PI / 2.0;
    }else{
        return atan(y, x);
    }
}

vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.y, xy.x), length(xy));
}

vec2 pol2xy(vec2 pol){
    return pol.y * vec2(cos(pol.x), sin(pol.x));
}

vec3 tex(vec2 st){ // s: 偏角, t: 動径
    vec3[3] col3 = vec3[](
        vec3(0.0,0.0,1.0),
        vec3(1.0,0.0,0.0),
        vec3(1.0,1.0,1.0)
    );
    st.s = st.s / PI + 1.0;
    int ind = int(st.s);
    vec3 col = mix(col3[ind % 2], col3[(ind + 1) % 2], fract(st.s));
    return mix(col3[2], col, st.t);
}

vec3 tex2(vec2 st){ // s: 偏角, t: 動径
    float time_ = 0.2 * time;
    vec3 circ = vec3(pol2xy(vec2(time_, 0.5)) + 0.5, 1.0); 
    vec3[3] col3 = vec3[](
        circ.rgb, circ.gbr, circ.brg
    );
    st.s = st.s / PI + 1.0;
    st.s += time_;
    int ind = int(st.s);
    vec3 col = mix(col3[ind % 2], col3[(ind + 1) % 2], fract(st.s));
    return mix(col3[2], col, st.t);
}

vec3 hsv2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 uv = vUv;
    uv = 2.0 * uv.xy - vec2(1.0);
    uv = xy2pol(uv);

    gl_FragColor = vec4(tex2(uv), opacity);
    //gl_FragColor = vec4(hsv2rgb(tex2(uv)), opacity);
}