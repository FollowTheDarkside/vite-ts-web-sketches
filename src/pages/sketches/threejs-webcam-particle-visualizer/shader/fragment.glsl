precision mediump float;

uniform float time;
uniform float drawingThreshold;
uniform float opacity;

varying vec3 vColor;
varying float vGray;

void main() {
    float gray = vGray;

    // Decide whether to draw particle
    if(gray > drawingThreshold){
        gray = 0.0;
    }else{
        gray = 1.0;
    }

    // Set vertex color
    gl_FragColor = vec4(vColor, gray * opacity);
}