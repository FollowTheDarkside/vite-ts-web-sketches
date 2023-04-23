precision mediump float;
precision highp sampler2DArray;

uniform sampler2D tDiffuse;
uniform float time;
uniform float speed;
uniform float scanlineDensity;
//uniform sampler2D videoTexture;
uniform sampler2DArray vTextures;
varying vec2 vUv;

void main() {
    // vec3 color = vec3(1.0, 0.0, 0.0);
    // float opacity = 1.0;
    // gl_FragColor = vec4(color, opacity);

    vec2 uv = vUv;

    //vec4 color = texture2D(tDiffuse, uv);
    //gl_FragColor = color;

    vec3 uvw = vec3(
        vUv.x,
        vUv.y,
        5
    );
    //vec4 color = texture2D(vTextures, uvw);
    vec4 color = texture(vTextures, uvw);
    //color = texture2D(tDiffuse, uv);
    gl_FragColor = color;

    // // Create a scanline pattern
    // float lines = floor(uv.y * scanlineDensity + time * speed);
    // float odd = mod(lines, 2.0);
    // float scanline = smoothstep(0.0, 0.1, abs(fract(uv.y * scanlineDensity + time * speed) - 0.05) - 0.05);
    // // Apply the slit scan effect
    // vec4 color = texture2D(tDiffuse, vec2(uv.x, fract(lines / scanlineDensity)));
    // gl_FragColor = mix(color, vec4(0.0), scanline);

    // float vTime = mod(time, 1.0);
    // float sl = mod(uv.y * scanlineDensity + vTime * speed, 1.0);
    // uv.y = sl;
    // gl_FragColor = texture2D(tDiffuse, uv);

    // //vec2 uv = fragCoord/iResolution.xy;
	// vec4 video = texture2D(tDiffuse, uv);
    // float pixel_w = 1.0 / 640.0;
    // uv.x -= pixel_w * speed;
	// vec4 buf = texture2D(tDiffuse, uv);
    // float split = 0.5;
  	// float effect_mask = step(uv.x, split);
    // gl_FragColor = mix(buf, video, effect_mask); 

    // float offset = (1.0/480);
    
    // float scanPosition = 0.5 + 0.5 * sin(iTime*0.05);
    
    // vec3 tex0 = texture( iChannel0, vec2(uv.x,scanPosition)).xyz;
    // vec3 tex1 = texture( iChannel1, vec2(uv.x,uv.y+offset)).xyz;
    
    // float mixValue = step(uv.y,1.0 - offset);

    // vec3 col = mix(tex0,tex1,mixValue);
        
    // gl_FragColor = vec4(col,1.0);
}