#version 300 es

in vec4 a_block_position; //position
in vec2 a_block_data; //data (x: id, y: face)
in vec2 a_texcoord; // coords

uniform mat4 u_projection_view_matrix;
uniform vec3 u_normals[6];

out vec2 v_texcoord;
out vec4 v_color;

float grassId = 2.0;

vec2 getTexture(float shiftValue) {
  return vec2(a_texcoord.x + shiftValue, a_texcoord.y) / 16.0f;
}

void main() {
  if(a_block_data[0] == -1.0f) {
    return;
  }

  int face = int(a_block_data[1]);
  vec3 normal = normalize(u_normals[face]);

  vec4 pos = a_block_position;
  vec4 projected_pos = pos * u_projection_view_matrix;
  projected_pos.z = -projected_pos.z;
  gl_Position = projected_pos;

  v_color = vec4(0.89f, 0.89f, 0.89f, 1.0f);

  bool isTop = normal.y == 1.0f;
  bool isBot = normal.y == -1.0f;
  bool isRight = normal.x == 1.0f;
  bool isLeft = normal.x == -1.0f;
  bool isBack = normal.z == -1.0f;
  bool isFront = normal.z == 1.0f;

  v_texcoord = getTexture(a_block_data[0]);

  if(isTop) {
    if(a_block_data[0] == grassId) {
      v_color = vec4(0.52f, 0.84f, 0.39f, 1.0f);
    }
  } else if(isBot) {
    if(a_block_data[0] == grassId) {
      v_texcoord = getTexture(a_block_data[0] - 2.0f);
    }
  } else if(a_block_data[0] == grassId) {
    v_texcoord = getTexture(a_block_data[0] - 1.0f);
  }
  if(isFront) {
    v_color = vec4(v_color.xyz * 1.0f, v_color.w);
  }
  if(isRight) {
    v_color = vec4(v_color.xyz * 0.9f, v_color.w);
  }
  if(isBack) {
    v_color = vec4(v_color.xyz * 0.8f, v_color.w);
  }
  if(isLeft) {
    v_color = vec4(v_color.xyz * 0.85f, v_color.w);
  }
  if(isBot) {
    v_color = vec4(v_color.xyz * 0.78f, v_color.w);
  }
}