#version 300 es

precision mediump float;

in lowp vec4 v_color;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    // gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
    vec4 texture = texture(u_texture, v_texcoord);
    if (v_color.w != 0.0) {
        texture = texture * v_color;
    }
    fragColor = texture;
}