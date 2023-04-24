// #define SIZE 8.0

uniform sampler2D iChannel0;
//uniform sampler2D iChannel1;
uniform vec2 iResolution;
uniform float size;
uniform bool isCamFront;
varying vec2 vUv;

vec3 getFrame(vec2 uv, float hd_frame, float n){
    
    float frame = floor(hd_frame * n * n) / n * n;
    float b = fract(frame - hd_frame * (n * n));

    float x = mod(frame, n) ;
    float y = floor(frame / n);
    
    vec2 uvb = uv;
    float xb = mod((frame + 1.0), n) ;
    float yb = floor((frame + 1.0) / n);
    
    uv += vec2(x, y);
    uv /= n;
    
    uvb += vec2(xb, yb);
    uvb /= n;
    
    return mix(texture(iChannel0, uvb).rgb, texture(iChannel0, uv).rgb, b);
}

void main()
{
    
    //vec2 uv = fragCoord/iResolution.xy;
    vec2 uv = vUv;
    if(isCamFront){
        uv.x = 1.0 - uv.x;
    }

    float n = size;
    
    // Change the gradient to change the type of scan
    float grad = uv.y;
    

    gl_FragColor = vec4( getFrame(uv, grad, n), 1.0);
}