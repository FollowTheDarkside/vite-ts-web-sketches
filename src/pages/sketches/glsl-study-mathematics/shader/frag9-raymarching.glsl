// 3Dレンダリング：レイマーチングによるレイとSDF形状の交差

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

float circleSDF(vec2 p, vec2 c, float r){
  return length(p - c) - r;
}

float contour(float v){
  return step(abs(v), 0.002);
}

float point(vec2 p, vec2 c){
  return step(length(p-c), 0.01);
}

float line(vec2 p, vec2 c, vec2 d){
  return step(abs(dot(p - c, vec2(-d.y, d.x))), 0.002);
}

void main(){
  vec4 col = vec4(1.0);
  //vec2 uv = vUv;

  float tmpMouseY = ((sin(time) + 1.0) / 2.0) * resolution.y;

  vec2 pos = (1.0 * gl_FragCoord.xy -resolution.xy)/ resolution.yy;
  vec2 cPos = vec2(-0.5, 0.0);  //camera position
  vec2 oPos = vec2(1.0, 0.0); //object position
  vec2 ray = oPos - cPos;
  ray.y +=  2.0 * tmpMouseY / resolution.y - 1.0;
  ray = normalize(ray);
  float rad = 0.8;
  vec2 rPos = cPos;
  col.rgb = contour(circleSDF(pos, oPos, rad)) * vec3(1);  //draw circle of object
  col.rgb += line(pos, cPos, ray) * vec3(0,0,1);  //draw line
  for (int i = 0; i < 50; i++){
    col.rgb += point(pos, rPos) * vec3(1.0, 0.0, 0.0);  //plot ray position
    float dist = circleSDF(rPos, oPos, rad);
    if (dist < 0.01){
      break;
    }
    col.rgb += contour(circleSDF(pos, rPos, dist)) * vec3(0.5, 0.5, 0.0);   //draw circle with radius of SDF value
    rPos += dist * ray;
    if (rPos.x > oPos.x + rad){
      break;
    }
  }
  gl_FragColor = vec4(col.rgb, opacity);
}