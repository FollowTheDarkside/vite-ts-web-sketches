uniform vec4 iMouse;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec2 iResolution;
uniform float iFrame;
varying vec2 vUv;

#define mousedata(a,b) texture2D( iChannel1, (0.5+vec2(a,b)) / iResolution.xy, -0.0 )
#define backbuffer(uv) texture2D( iChannel0, uv ).xy

float lineDist(vec2 p, vec2 start, vec2 end, float width) {
    vec2 dir = start - end;
    float lngth = length(dir);
    dir /= lngth;
    vec2 proj = max(0.0, min(lngth, dot((start - p), dir))) * dir;
    return length( (start - p) - proj ) - (width / 2.0);
}

void main() {
    vec2 uv = vUv;
    vec2 col = uv;
    if (iFrame > 2.) {
        col = texture2D(iChannel0,uv).xy;
        vec2 mouse = iMouse.xy/iResolution.xy;
        vec2 p_mouse = mousedata(2.,0.).xy;
        if (mousedata(4.,0.).x > 0.) {
            col = backbuffer(uv+((p_mouse-mouse)*clamp(1.-(lineDist(uv,mouse,p_mouse,0.)*20.),0.,1.)*.7));
        }
    }
    gl_FragColor = vec4(col,0.0,1.0);
}