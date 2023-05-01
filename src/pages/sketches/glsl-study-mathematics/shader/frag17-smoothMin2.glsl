// Study

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

float sphereSDF(vec3 p, vec3 cent, float rad){
  return distance(p, cent) - rad;
}

float smin(float a, float b, float k){ // 滑らかなmin関数
  float h = clamp(0.5 - 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(a, b, h) - k * h * (1.0 - h); 
}

float sceneSDF(vec3 p){
  float[3] smallS, bigS, middleS;
  for(int i = 0; i < 3; i ++ ){
    smallS[i] = sphereSDF(p, vec3(float(i - 1), sin(time+float(i)), 0.0), 0.2);
    bigS[i] = sphereSDF(p, vec3(float(i - 1)*sin(time), 0.0, 0.0), 0.4);
    middleS[i] = sphereSDF(p, vec3(-float(i - 1), -sin(time-float(i)), 0.0), 0.3);
  }
  float cap = smin(smallS[0], bigS[0], 0.1);
  float cup = smin(smallS[1], bigS[1], 0.3);
  float minus = smin(smallS[2], bigS[2], 0.5);
  float cap_ = smin(middleS[0], bigS[0], 0.1);
  float cup_ = smin(middleS[1], bigS[1], 0.3);
  float minus_ = smin(middleS[2], bigS[2], 0.5);
  return min(min(min(cap, cup), minus), min(min(cap_, cup_), minus_));
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

  vec3 cPos = vec3(0.0, 0.0, 2.0);
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
      vec3 lightCol = vec3(0.1, 0.9, 0.7);
      col.rgb = lightCol * (diff + amb);
      break;
    }
  }
  gl_FragColor = vec4(col.rgb, opacity);
}