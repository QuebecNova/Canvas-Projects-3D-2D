attribute vec4 a_position;
attribute vec4 a_color;
varying vec4 v_color;
uniform mat4 u_matrix;

void main() {
  vec4 position = a_position * u_matrix;

  gl_Position = vec4(position.xyz, position.w);

  v_color = a_position;
}