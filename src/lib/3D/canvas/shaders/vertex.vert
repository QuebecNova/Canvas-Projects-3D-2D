attribute vec4 a_position;
attribute vec4 a_color;
varying vec4 v_color;
uniform mat4 u_matrix;

void main() {
  vec4 pos = a_position * u_matrix;
  gl_Position = vec4(pos.xy, -pos.z, pos.w);

  v_color = a_color;
}