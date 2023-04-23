uniform vec4 iMouse;
uniform sampler2D iChannel0;
uniform vec3 iResolution;
varying vec2 vUv;

bool pixelAt(vec2 coord, float a, float b) {
    return (floor(coord.x) == a && floor(coord.y) == b);
}

vec4 backbuffer(float a,float b) {
    return texture2D( iChannel0, (0.5+vec2(a,b)) / iResolution.xy, -100.0 );
}

void main( ) {

    vec2 uv = vUv;// / iResolution.xy;
    vec4 color = texture2D(iChannel0,uv);

    if (pixelAt(gl_FragCoord.xy,0.,0.)) { //Surface position
        gl_FragColor = vec4(backbuffer(0.,0.).rg+(backbuffer(4.,0.).r*(backbuffer(2.,0.).rg-backbuffer(1.,0.).rg)),0.,1.);
    } else if (pixelAt(gl_FragCoord.xy,1.,0.)) { //New mouse position
        gl_FragColor = vec4(iMouse.xy/iResolution.xy,0.,1.);
    } else if (pixelAt(gl_FragCoord.xy,2.,0.)) { //Old mouse position
        gl_FragColor = vec4(backbuffer(1.,0.).rg,0.,1.);
    } else if (pixelAt(gl_FragCoord.xy,3.,0.)) { //New mouse holded
        gl_FragColor = vec4(clamp(iMouse.z,0.,1.),0.,0.,1.);
    } else if (pixelAt(gl_FragCoord.xy,4.,0.)) { //Old mouse holded
        gl_FragColor = vec4(backbuffer(3.,0.).r,0.,0.,1.);
    } else {
        gl_FragColor = vec4(0.,0.,0.,1.);
    }

}