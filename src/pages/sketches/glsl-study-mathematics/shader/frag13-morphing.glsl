// SDFの調理法：モーフィング

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

const float PI = 3.14159265359;

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

float sphereSDF(vec3 p, vec3 cent, float rad){
  return length(p - cent) - rad;
}

float sceneSDF(vec3 p){
  float t = 0.5* time;
  p = euler(p, vec3(t));
  float d1 = 1.0;
  for (float i = 0.0; i < 6.0; i++){ // 6個の級の和集合のSDF
    vec3 cent = vec3(cos(PI * i / 3.0), sin(PI * i / 3.0), 0.0); // 円周上に球を配置
    d1 = min(d1, sphereSDF(p, cent, 0.2));
  }
  float d2 = sphereSDF(p, vec3(0.0), 1.); // 原点を中心とした球のSDF
  return mix(d1, d2, abs(mod(t, 2.0) - 1.0)); // 2つのSDFの補間
}

vec3 gradSDF(vec3 p){
  float eps = 0.0001;
  return normalize(vec3(
    sceneSDF(p + vec3(eps, 0.0, 0.0)) - sceneSDF(p + vec3(-eps, 0.0, 0.0)),
    sceneSDF(p + vec3(0.0, eps, 0.0)) - sceneSDF(p + vec3(0.0, - eps, 0.0)),
    sceneSDF(p + vec3(0.0, 0.0, eps)) - sceneSDF(p + vec3(0.0, 0.0, - eps))
  ));
}

void main(){
  vec4 col = vec4(1.0);
  //vec2 uv = vUv;

  vec2 p = (gl_FragCoord.xy * 1.0 - resolution) / min(resolution.x, resolution.y);
  
  vec3 cPos = vec3(0.0, 0.0, 2.5);
  vec3 cDir = vec3(0.0, 0.0, - 1.0);
  vec3 cUp = vec3(0.0, 1.0, 0.0);
  vec3 cSide = cross(cDir, cUp);
  float targetDepth = 1.0;
  
  vec3 lDir = vec3(0.0, 0.0, 1.0);
  
  vec3 ray = cSide * p.x + cUp * p.y + cDir * targetDepth;
  
  vec3 rPos = cPos + ray;
  ray = normalize(ray);
  col.rgb = vec3(0.0);
  for(int i = 0; i < 50; i ++ ){
    if (sceneSDF(rPos) > 0.001){
      rPos += sceneSDF(rPos) * ray;
    } else {
      float amb = 0.1;
      float diff = 0.9 * max(dot(normalize(lDir), gradSDF(rPos)), 0.0);
      vec3 lightCol = vec3(1.0);
      col.rgb = lightCol * (diff + amb);
      break;
    }
  }
  gl_FragColor = vec4(col.rgb, opacity);
}