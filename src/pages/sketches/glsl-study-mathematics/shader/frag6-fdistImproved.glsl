// 胞体ノイズ（セルラーノイズ、ウォーリーノイズ）：第1近傍距離の計算の改良

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

float fdist21(vec2 p){
  vec2 n = floor(p + 0.5); // 最も近い格子点
  float dist = sqrt(2.0);
  for(float j = 0.0; j <= 2.0; j ++ ){ // 探索範囲を狭める
    vec2 glid; // 近くの格子点
    glid.y = n.y + sign(mod(j, 2.0) - 0.5) * ceil(j * 0.5); // 探索順位を変える
    if (abs(glid.y - p.y) - 0.5 > dist){ // 行単位での距離の下限がdistを上回る場合はその行での探索をスキップ
      continue;
    }
    for(float i = -1.0; i <= 1.0; i ++ ){ // 探索範囲を狭める
      glid.x = n.x + i;
      vec2 jitter = hash22(glid) - 0.5;
      dist = min(dist, length(glid + jitter - p));
    }
  }
  return dist;
}

float fdist31(vec3 p){
  vec3 n = floor(p + 0.5);
  float dist = sqrt(3.0);
  for(float k = 0.0; k <= 2.0; k ++ ){
      vec3 glid;
      glid.z = n.z + sign(mod(k, 2.0) - 0.5) * ceil(k * 0.5);
      if (abs(glid.z - p.z) - 0.5 > dist){
        continue;
      }
    for(float j = 0.0; j <= 2.0; j ++ ){
      glid.y = n.y + sign(mod(j, 2.0) - 0.5) * ceil(j * 0.5);
      if (abs(glid.y - p.y) - 0.5 > dist){
        continue;
      }
      for(float i = -1.0; i <= 1.0; i ++ ){
        glid.x = n.x + i;
        vec3 jitter = hash33(glid) - 0.5;
        dist = min(dist, length(glid + jitter - p));
      }
    }
  }
  return dist;
}

void main(){
  vec4 col = vec4(1.0);
  //vec2 uv = vUv;

  vec2 pos = gl_FragCoord.xy/ min(resolution.x, resolution.y);
  channel = int(1.0 * gl_FragCoord.x/ resolution.x); 
  pos *= 10.0;
  pos += time;
  col = channel == 0 ? vec4(fdist21(pos)) : vec4(fdist31(vec3(pos, time)));
  gl_FragColor = vec4(col.rgb, opacity);
}