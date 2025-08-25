precision mediump float;

varying lowp vec4 v_color;

void main() {
    // gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
    gl_FragColor = v_color;
}