precision mediump float;

uniform float time;
uniform float drawingThreshold;
uniform float opacity;
uniform bool drawingInvert;

varying vec3 vColor;
varying float vGray;

void main() {
    float gray = vGray;

    // Decide whether to draw particle
    if(drawingInvert){
        gray = (gray > drawingThreshold) ? 0.0 : 1.0;
    }else{
        gray = (gray > drawingThreshold) ? 1.0 : 0.0;
    }

    // Set vertex color
    gl_FragColor = vec4(vColor, gray * opacity);
}