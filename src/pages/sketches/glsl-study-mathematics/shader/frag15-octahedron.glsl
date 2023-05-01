// SDFの調理法：折りたたみ（空間を折って束ねる絶対値関数）で構成した正八面体（プラトン立体）と球

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

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

vec3 euler(vec3 p, vec3 t){
  return rotZ(rotY(rotX(p, t.x), t.y), t.z);
}
//end rot

float smin(float d1, float d2, float r){
  float c = clamp(0.5 + (d2 - d1) * (0.5 / r), 0.0, 1.0);
  return mix(d2, d1, c) - r * c * (1.0 - c);
}

float sphereSDF(vec3 p, vec3 c, float r){
  return length(p - c) - r;
}

float planeSDF(vec3 p, vec3 n, float s){ // n:法線, s:原点と平面の距離
  return dot(normalize(n), p) - s;
}

float octaSDF(vec3 p, float s){ // s:正八面体のサイズ
  return planeSDF(abs(p), vec3(1.0), s);
}

float sceneSDF(vec3 p){
  float t = 0.3 + 0.2 * sin(time);
  float d1 = octaSDF(p, 0.5);
  float d2 = sphereSDF(abs(p), vec3(t), 0.1);
  return smin(d1, d2, 0.1);
}

vec3 gradSDF(vec3 p){
  float eps = 0.001;
  return normalize(vec3(
    sceneSDF(p + vec3(eps, 0.0, 0.0)) - sceneSDF(p - vec3(eps, 0.0, 0.0)),
    sceneSDF(p + vec3(0.0, eps, 0.0)) - sceneSDF(p - vec3(0.0, eps, 0.0)),
    sceneSDF(p + vec3(0.0, 0.0, eps)) - sceneSDF(p - vec3(0.0, 0.0, eps))
  ));
}

void main(){
  vec4 col = vec4(1.0);
  //vec2 uv = vUv;

  vec2 p = (gl_FragCoord.xy * 1.0 - resolution) / min(resolution.x, resolution.y);
  
  vec3 t = vec3(time * 0.3);
  vec3 cPos = euler(vec3(0.0, 0.0, 2.0), t);
  vec3 cDir = euler(vec3(0.0, 0.0, - 1.0), t);
  vec3 cUp = euler(vec3(0.0, 1.0, 0.0), t);
  vec3 cSide = cross(cDir, cUp);
  
  float targetDepth = 1.0;
  
  vec3 lDir = euler(vec3(0.0, 0.0, 1.0), t);
  
  vec3 ray = cSide * p.x + cUp * p.y + cDir * targetDepth;
  vec3 rPos = ray + cPos;
  ray = normalize(ray);
  col.rgb = vec3(0.0);
  for(int i = 0; i < 50; i ++ ){
    if (sceneSDF(rPos) > 0.001){
      rPos += sceneSDF(rPos) * ray;
    } else {
      float amb = 0.1;
      float diff = 0.9 * max(dot(normalize(lDir), gradSDF(rPos)), 0.0);
      vec3 lightCol = vec3(0.0, 1.0, 1.0);
      col.rgb = lightCol * (diff + amb);
      break;
    }
  }
  gl_FragColor = vec4(col.rgb, opacity);
}