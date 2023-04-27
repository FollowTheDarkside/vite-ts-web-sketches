// 符号なし整数の可視化

precision highp float;
precision highp int;

uniform float opacity;
uniform float time;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    uv *= vec2(32.0, 9.0);
    uint[9] a = uint[]( // 2進数表示する符号なし整数の配列
        uint(time),
        0xbu, // 符号なし整数としての16進数のB
        9u, // 符号なし整数としての9
        0xbu ^ 9u, // XOR演算
        0xffffffffu, // 符号なし整数の最大値
        0xffffffffu + uint(time), // オーバーフロー
        floatBitsToUint(floor(time)), // 浮動小数点数のビット列を符号なし整数に変換
        floatBitsToUint(-floor(time)),
        floatBitsToUint(11.5625)
    );
    if(fract(uv.x)<0.1){
        if(floor(uv.x)==1.0){
            gl_FragColor = vec4(1, 0, 0, opacity);
        }else if(floor(uv.x)==9.0){
            gl_FragColor = vec4(0, 1, 0, opacity);
        }else{
            gl_FragColor = vec4(0.5);
        }
    }else if(fract(uv.y)<0.1){
        gl_FragColor = vec4(0.5);
    }else{
        uint b = a[int(uv.y)];
        b = (b << uint(uv.x)) >> 31;
        gl_FragColor = vec4(vec3(b), opacity);
    }

    //gl_FragColor = vec4(col, opacity);
}