#version 300 es

in vec4 a_position;
in vec2 a_texcoord;
in mat4 a_buffer_matrix;
in vec2 a_blocks;
in vec3 a_normal;
uniform mat4 u_projection_view_matrix;
uniform mat4 u_translation_matrix;
uniform mat4 u_rotation_matrix;
uniform mat4 u_scale_matrix;
out vec2 v_texcoord;
out vec4 v_color;

int FRONT = 1 << 0;
int BACK = 1 << 1;
int TOP = 1 << 2;
int BOT  = 1 << 3;
int RIGHT = 1 << 4;
int LEFT = 1 << 5;
int IS_NOT_VISIBLE = 63;

float grassId = 2.0;

vec2 getTexture(float shiftValue) {
  return vec2(a_texcoord.x + shiftValue, a_texcoord.y) / 16.0;
}

bool cullFace(int blockInDirection, vec3 normal) {
  if (blockInDirection == IS_NOT_VISIBLE) return true;
  if ((blockInDirection & FRONT) != 0 && normal.z == 1.0) {
    return true;
  }
  if ((blockInDirection & TOP) != 0 && normal.y == 1.0) {
    return true;
  }
  if ((blockInDirection & BACK) != 0 && normal.z == -1.0) {
    return true;
  }
  if ((blockInDirection & BOT) != 0 && normal.y == -1.0) {
    return true;
  }
  if ((blockInDirection & RIGHT) != 0 && normal.x == 1.0) {
    return true;
  }
  if ((blockInDirection & LEFT) != 0 && normal.x == -1.0) {
    return true;
  }
  return false;
}

void main() {
  if(a_blocks[0] == -1.0) {
    return;
  }
  vec3 normal = normalize(a_normal);

  int blockInDirection = int(a_blocks[1]);

  if (cullFace(blockInDirection, normal)) {
    return;
  }
  vec4 pos = a_buffer_matrix * a_position;
  vec4 projected_pos = pos * u_projection_view_matrix;
  projected_pos.z = -projected_pos.z;
  gl_Position = projected_pos;

  v_color = vec4(0.89f, 0.89f, 0.89f, 1.0f);

  bool isTop = normal.y == 1.0;
  bool isBot = normal.y == -1.0;
  bool isRight = normal.x == 1.0;
  bool isLeft = normal.x == -1.0;
  bool isBack = normal.z == -1.0;
  bool isFront = normal.z == 1.0;

  v_texcoord = getTexture(a_blocks[0]);


  if(isTop) {
    if(a_blocks[0] == grassId) {
      v_color = vec4(0.52f, 0.84f, 0.39f, 1.0f);
    }
  } else if(isBot) {
    if(a_blocks[0] == grassId) {
      v_texcoord = getTexture(a_blocks[0] - 2.0);
    }
  } else if(a_blocks[0] == grassId) {
    v_texcoord = getTexture(a_blocks[0] - 1.0);
  }
  if (isFront) {
    v_color = vec4(v_color.xyz*1.0, v_color.w);
  }
  if (isRight) {
    v_color = vec4(v_color.xyz*0.9, v_color.w);
  }
  if (isBack) {
    v_color = vec4(v_color.xyz*0.8, v_color.w);
  }
  if (isLeft) {
    v_color = vec4(v_color.xyz*0.85, v_color.w);
  }
  if (isBot) {
    v_color = vec4(v_color.xyz*0.78, v_color.w);
  }
}