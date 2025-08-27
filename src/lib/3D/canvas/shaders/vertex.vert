attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute mat4 a_buffer_matrix;
varying vec4 v_color;
uniform mat4 u_projection_view_matrix;
uniform mat4 u_translation_matrix;
uniform mat4 u_rotation_matrix;
uniform mat4 u_scale_matrix;
varying vec2 v_texcoord;

vec2 getTexture(float shiftValue) {
  return vec2(a_texcoord.x + shiftValue, a_texcoord.y) / 16.0;
}

void main() {
  vec4 pos = a_buffer_matrix * a_position;
  vec4 projected_pos = pos * u_projection_view_matrix;
  projected_pos.z = -projected_pos.z;
  gl_Position = projected_pos;
  v_color = vec4(0.0);

  vec2 dirt = getTexture(0.0);
  vec2 grassSide = getTexture(1.0);
  vec2 grassTop = getTexture(2.0);
  vec2 stone = getTexture(3.0);
  float y = a_buffer_matrix[3][1];
  bool isTop = a_position.y == 1.00001;
  bool isBot = a_position.y == -0.00001;
  if (y == 0.0) v_texcoord = stone;
  if (y == 1.0) v_texcoord = dirt;
  if (y == 2.0) v_texcoord = dirt;
  if (y == 3.0) v_texcoord = grassSide;
  if (y == 3.0 && isTop) {
    v_color = vec4(0.59, 0.88, 0.41, 1.0);
    v_texcoord = grassTop;
  };
  if (y == 3.0 && isBot) v_texcoord = dirt;
}