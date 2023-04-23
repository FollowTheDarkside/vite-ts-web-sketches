precision mediump float;
precision highp sampler2DArray;

uniform float time;
//uniform sampler2D videoTexture;
uniform sampler2D vTexture;
uniform sampler2DArray vTextures;
uniform int arrayIndex;
varying vec2 vUv;

void main() {
    // vec3 color = vec3(1.0, 0.0, 0.0);
    // float opacity = 1.0;
    // gl_FragColor = vec4(color, opacity);

    vec2 uv = vUv;

    vec4 color_ = texture(vTexture, uv);
    //gl_FragColor = color_;

    // =================================

    vec3 uvw = vec3(
        vUv.x,
        vUv.y,
        10
    );
    //vec4 color = texture2D(vTextures, uvw);
    //vec4 color = texture(vTextures, uvw);
    //vec4 color = texture(vTextures, vec3( vUv, 10 ));
    vec4 color = vec4(texture(vTextures, vec3( vUv, 10 )).rgb, 1.0);
    //color = vec4( color.rgb / 255.0, 1.0 );
    //color = color / 255.0;
    //vec4 color = texture2DArray(vTextures, vec3( vUv, 10 ));
    //vec4 color = texture(vTextures, vec3( vUv, arrayIndex ));
    //color = texture2D(tDiffuse, uv);
    //color = color * vec4(0.);
    //color = vec4(0, 1, 1, 1);

    //gl_FragColor = color;
    //gl_FragColor = vec4( color.rgb, 1.0 );
    //gl_FragColor = vec4( color.a * 1.0, 0.0, 0.0, 1.0 );

    gl_FragColor = mix(color_, color , 0.75);
}