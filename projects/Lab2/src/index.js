import {VertexArray} from './VertexArray';
import {VertexAttributes} from './VertexAttributes';
import {ShaderProgram} from './ShaderProgram';
import {Matrix4} from './Matrix4';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
console.log(window.gl);

let vertexArray;
let shaderProgram;
let transform;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('transform', transform);
  //shaderProgram.setUniform1f('radians', 3.14);
  vertexArray.bind();
  vertexArray.drawSequence(gl.TRIANGLES);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

async function initialize() {
  transform = Matrix4.identity();
  //transform = Matrix4.scale([2, 0.5, 1]);
  //transform = Matrix4.multiplyMatrix4(transform,Matrix4.rotateZ(45))
  console.log(transform.elements);
  //transform = Matrix4.translate([0.3, -0.5, 0.5]);
  //transform = Matrix4.rotateZ(45);
  // ...
  const vertexSource = `
  uniform float radians;
  uniform mat4 transform;

  in vec3 position;
  in vec3 color;

  out vec3 fcolor;

  void main() {
    gl_Position = transform * vec4(position, 1.0);
    gl_PointSize = 2.0; 
    fcolor = color;
  }
  `;

  const fragmentSource = `
  in vec3 fcolor;

  out vec4 fragmentColor;

  void main() {
    fragmentColor = vec4(fcolor, 1.0);
  }
  `;
  const positions = [
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
    -0.5,  0.5, 0,
  ];

  const colors = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ];

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 3, 3, positions);
  attributes.addAttribute('color', 3, 3, colors);
  vertexArray = new VertexArray(shaderProgram, attributes);

  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

initialize();