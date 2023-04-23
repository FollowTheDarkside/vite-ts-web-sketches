// #define SIZE 8.0

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 iResolution;
uniform float size;
varying vec2 vUv;

vec3 storeFrame(vec2 uv){
   float box = step( 0., uv.x )*step( uv.x, 1./size )*step( 0., uv.y )*step( uv.y, 1./size );

  float oldSqx = floor(uv.x*size);
  float oldSqy = floor(uv.y*size);
  float oldIndex = oldSqy*size+oldSqx;
  vec2 oldPos = vec2( oldSqx, oldSqy )/size;
  oldIndex-=1.;

  float shiftSqy = floor( oldIndex/size );
  float shiftSqx = oldIndex-shiftSqy*size;
  vec2 shiftPos = vec2( shiftSqx, shiftSqy )/size;

  vec3 old = texture( iChannel1, uv+(shiftPos-oldPos) ).rgb*(1.-box);
  vec3 raw = texture( iChannel0, uv*size ).rgb*box;

  return raw + old;
}

void main()
{
    //vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 uv = vUv;
    gl_FragColor = vec4(storeFrame(uv), 1.0);
}