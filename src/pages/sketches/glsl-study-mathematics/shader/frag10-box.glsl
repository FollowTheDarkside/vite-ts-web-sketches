// 3Dレンダリング：回転する箱のレンダリング

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

const float PI = 3.14159265359;
const float TAU = 6.2831853;

//begin rot
vec2 rot2(vec2 p, float t){
  return vec2(cos(t) * p.x -sin(t) * p.y, sin(t) * p.x + cos(t) * p.y);
}

vec3 rotX(vec3 p, float t){
  return vec3(p.x, rot2(p.yz, t));
}

vec3 rotY(vec3 p, float t){
  return vec3(p.y, rot2(p.zx, t)).zxy;
}

vec3 rotZ(vec3 p, float t){
  return vec3(rot2(p.xy, t), p.z);
}

vec3 euler(vec3 p, vec3 t){ // オイラー角を使った回転
  return rotZ(rotY(rotX(p, t.x), t.y), t.z);
}
//end rot

float boxSDF(vec3 p, vec3 c, vec3 d, float t){ // c:中心、d:中心から頂点までの距離、t:箱の厚み
  p = abs(p - c);
  return length(max(p - d, vec3(0.0))) + min(max(max(p.x - d.x, p.y - d.y), p.z - d.z), 0.0) - t;
}

float sceneSDF(vec3 p){
  vec3 center = vec3(0.0, 0.0, 0.0);
  vec3 scale = vec3(0.5);
  float thickness = 0.1;
  return boxSDF(p, center, scale, thickness);
}

vec3 gradSDF(vec3 p){ // 法線の計算
  float eps = 0.001;
  return normalize(vec3( // 勾配を正規化
    sceneSDF(p + vec3(eps, 0.0, 0.0)) - sceneSDF(p - vec3(eps, 0.0, 0.0)),
    sceneSDF(p + vec3(0.0, eps, 0.0)) - sceneSDF(p - vec3(0.0, eps, 0.0)),
    sceneSDF(p + vec3(0.0, 0.0, eps)) - sceneSDF(p - vec3(0.0, 0.0, eps))
  ));
}

void main(){
  vec4 col = vec4(1.0);
  //vec2 uv = vUv;

  vec2 p = (gl_FragCoord.xy * 1.0 - resolution) / min(resolution.x, resolution.y);
  
  vec3 t = vec3(time * 0.5);
  vec3 cPos = euler(vec3(0.0, 0.0, 2.0), t);
  vec3 cDir = euler(vec3(0.0, 0.0, - 1.0), t);
  vec3 cUp = euler(vec3(0.0, 1.0, 0.0), t);
  vec3 lDir = euler(vec3(0.0, 0.0, 1.0), t);
  vec3 cSide = cross(cDir, cUp);

  float targetDepth = 1.0;
  
  vec3 ray = cSide * p.x + cUp * p.y + cDir * targetDepth;
  vec3 rPos = ray + cPos;
  ray = normalize(ray);
  col.rgb = vec3(0.0);
  for(int i = 0; i < 50; i ++ ){ // レイマーチング
    if (sceneSDF(rPos) > 0.001){
      rPos += sceneSDF(rPos) * ray;
    } else { // レイが交差する場合
      float amb = 0.1;
      float diff = 0.9 * max(dot(normalize(lDir), gradSDF(rPos)), 0.0);
      vec3 lightCol = vec3(0.0, 1.0, 1.0); // 光の色
      col.rgb = lightCol * (diff + amb);
      break;
    }
  }
  gl_FragColor = vec4(col.rgb, opacity);
}