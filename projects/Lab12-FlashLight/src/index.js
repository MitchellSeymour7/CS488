import { VertexArray } from './vertex_array';
import { VertexAttributes } from './vertex_attributes';
import { ShaderProgram } from './shader_program';
import { Matrix4 } from './Matrix4';
import { Vector3 } from './Vector3';
import { Vector2 } from './Vector2';

import { Trackball } from './Trackball';
import { Noise } from './Noise';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let clipFromEye;
let texture;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  shaderProgram.setUniformMatrix4('eyeFromModel', Matrix4.identity());
  shaderProgram.setUniform1i('image', 0);
  shaderProgram.setUniform1i('normal', 1);

  vertexArray.bind();
  vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const aspectRatio = canvas.width / canvas.height;

  let right;
  let top;

  if (aspectRatio < 1) {
    right = 2;
    top = right / aspectRatio;
  } else {
    top = 2;
    right = top * aspectRatio;
  }

  clipFromEye = Matrix4.ortho(-right, right, -top, top, -1000, 1000);

  render();
}

function generateNoise(width, height, depth) {
  const bytes = Noise.field3(new Vector3(width, height, depth), new Vector3(0.1, 0.1, 0.1), 3);
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_3D, texture);
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.R8, width, height, depth, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);

  gl.generateMipmap(gl.TEXTURE_3D);

  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT);

}

function generateQuad(depth) {

  const positions = [
     1, 1, depth,
    -1, 1, depth,
     1,-1, depth,
    -1,-1, depth,
  ];
  const texcoords = [
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  const indices = [
    0, 1, 2,
    2, 1, 3
  ];

  return { positions, texcoords, indices };
}

async function initialize() {

  const { positions, texcoords, indices } = generateQuad(-10);
  const wallColor = await loadTexture('SquareBlockWall_S.jpg', gl.TEXTURE0);
  const wallNormal = await loadTexture('SquareBlockWall_N.jpg', gl.TEXTURE1);
  const wallFlashlight = await loadTexture('flashlight4.png', gl.TEXTURE2);

  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 4, 3, positions);
  attributes.addAttribute('texcoords', 4, 2, texcoords);
  attributes.addIndices(indices);

  const vertexSource = `
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromModel;
  in vec3 position;
  in vec2 texcoords;
  out vec2 ftexcoords;

  out vec3 fposition;
  out vec3 positionEye;
  
  void main() {
    gl_Position = clipFromEye * eyeFromModel * vec4(position, 1.0);
    positionEye = (eyeFromModel * vec4(position, 1.0)).xyz; 
    fposition = position;
    ftexcoords = texcoords;
    }
  `;

  const fragmentSource = `
  uniform sampler2D image;
  uniform sampler2D normal;

  in vec3 fposition;
  in vec3 positionEye;
  in vec2 ftexcoords;
  out vec4 fragmentColor;


  const vec3 lightColor = vec3(1.0, 1.0, 1.0);
  const vec3 lightPosition = vec3(100.0);
  const float ambientWeight = 0.1;

  void main() {
    vec3 lightColor = texture(image, ftexcoords).rgb;
    vec3 normal = texture(normal, ftexcoords).rgb;
    fragmentColor = vec4(lightColor,1.0);
    vec3 lightVector =  normalize(lightPosition - positionEye);

    // Diffuse
    float litness = max(0.0, dot(normal, lightVector));
    vec3 diffuse = litness * lightColor * (1.0 - ambientWeight);

    // Ambient
    vec3 ambient = lightColor * ambientWeight;    

    vec3 rgb = ambient + diffuse;
    fragmentColor = vec4(rgb, 1.0);
  }
  `;

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  vertexArray = new VertexArray(shaderProgram, attributes);

  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}


async function loadTexture(url, textureUnit = gl.TEXTURE0) {
  const image = new Image();
  image.src = url;
  await image.decode();

  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  return texture;
}

initialize();