// 値ノイズの構成法

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

int channel;

//start hash
uvec3 k = uvec3(0x456789abu, 0x6789ab45u, 0x89ab4567u);
uvec3 u = uvec3(1, 2, 3);
const uint UINT_MAX = 0xffffffffu;

uint uhash11(uint n){
    n ^= (n << u.x);
    n ^= (n >> u.x);
    n *= k.x;
    n ^= (n << u.x);
    return n * k.x;
}

uvec2 uhash22(uvec2 n){
    n ^= (n.yx << u.xy);
    n ^= (n.yx >> u.xy);
    n *= k.xy;
    n ^= (n.yx << u.xy);
    return n * k.xy;
}

uvec3 uhash33(uvec3 n){
    n ^= (n.yzx << u);
    n ^= (n.yzx >> u);
    n *= k;
    n ^= (n.yzx << u);
    return n * k;
}

float hash11(float p){
    uint n = floatBitsToUint(p);
    return float(uhash11(n)) / float(UINT_MAX);
}

float hash21(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return float(uhash22(n).x) / float(UINT_MAX);
}

float hash31(vec3 p){
    uvec3 n = floatBitsToUint(p);
    return float(uhash33(n).x) / float(UINT_MAX);
}

vec2 hash22(vec2 p){
    uvec2 n = floatBitsToUint(p);
    return vec2(uhash22(n)) / vec2(UINT_MAX);
}

vec3 hash33(vec3 p){
    uvec3 n = floatBitsToUint(p);
    return vec3(uhash33(n)) / vec3(UINT_MAX);
}
//end hash

float vnoise21(vec2 p){ // ２次元ノイズ
    vec2 n = floor(p);
    float[4] v;
    for (int j = 0; j < 2; j ++){
        for (int i = 0; i < 2; i++){
            v[i+2*j] = hash21(n + vec2(i, j)); // マスの４頂点のハッシュ値
        }
    }
    vec2 f = fract(p);
    if (channel == 1){  // 中央：エルミート補間
        f = f * f * (3.0 -2.0 * f); // Hermite interpolation
    }
    return mix(mix(v[0], v[1], f[0]), mix(v[2], v[3], f[0]), f[1]); // 左：双線形補間
}

float vnoise31(vec3 p){
    vec3 n = floor(p);
    float[8] v;
    for (int k = 0; k < 2; k++ ){
        for (int j = 0; j < 2; j++ ){
            for (int i = 0; i < 2; i++){
                v[i+2*j+4*k] = hash31(n + vec3(i, j, k)); // マスの８頂点のハッシュ値
            }
            
        }
    }
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // エルミート補間、Hermite interpolation
    float[2] w;
    for (int i = 0; i < 2; i++){
        w[i] = mix(mix(v[4*i], v[4*i+1], f[0]), mix(v[4*i+2], v[4*i+3], f[0]), f[1]); // 底面と上面での補間
    }
    return mix(w[0], w[1], f[2]); // 高さに関する補間
}

void main(){
    vec4 col = vec4(1.0);
    //vec2 uv = vUv;
    vec2 pos = gl_FragCoord.xy/min(resolution.x, resolution.y);
    channel = int(gl_FragCoord.x * 3.0 / resolution.x);
    pos = 10.0 * pos + time; // [0,10]区間にスケールして移動
    if (channel < 2){
        col = vec4(vnoise21(pos));  // left/center: ２次元ノイズ
    } else {
        col = vec4(vnoise31(vec3(pos, time)));  // right: ３次元ノイズ
    }
    gl_FragColor = vec4(col.rgb, opacity);
}