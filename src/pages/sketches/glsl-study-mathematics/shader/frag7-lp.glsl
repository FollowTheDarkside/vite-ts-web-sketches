// 距離とSDF（幾何学的形状との距離を測るための数学的な距離計）：Lpノルム

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

const float PI = 3.14159265359;

float length2(vec2 p){
  p = abs(p);
  float d = 4.0 * sin(0.5 * time) + 5.0;
  return pow(pow(p.x, d) + pow(p.y, d), 1.0 / d);
}

float circle(vec2 p, vec2 c, float r){
  return length2(p - c) - r; // cの近傍
}

vec3 contour(float v, float interval){ // 等高線の描画
  return abs(v) < 0.01 ? vec3(0.0): // 0等高線を黒で描画
  mod(v, interval) < 0.01 ? vec3(1.0): // 等間隔の値の等高線を白で描画
  mix(vec3(0, 0, 1), vec3(1, 0, 0), atan(v) / PI + 0.5); // 等高線以外は赤と青の中間色で値を表す
}

void main(){
  vec4 col = vec4(1.0);
  //vec2 uv = vUv;

  vec2 pos = (1.0 * gl_FragCoord.xy -resolution.xy)/ min(resolution.x, resolution.y); // ビューポートの中心を原点としてスケール
  col.rgb = vec3(contour(circle(pos, vec2(0.0), 1.0), 0.1));
  gl_FragColor = vec4(col.rgb, opacity);
}