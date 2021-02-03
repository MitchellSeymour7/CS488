import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
console.log(window.gl);

let vertex_array;
let shader_program;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  shader_program.bind();
  shader_program.setUniform1f('radians', 3.14);
  vertex_array.bind();
  vertex_array.drawSequence(gl.TRIANGLES);
  vertex_array.unbind();
  shader_program.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

async function initialize() {
  const vertexSource = `
  uniform float radians;

  in vec3 position;
  in vec3 color;

  out vec3 fcolor;

  void main() {
    gl_Position = vec4(
      cos(radians) * position.x - sin(radians) * position.y,
      sin(radians) * position.x + cos(radians) * position.y,
      position.z,
      1.0
    );
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

  shader_program = new ShaderProgram(vertexSource, fragmentSource);
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 3, 3, positions);
  attributes.addAttribute('color', 3, 3, colors);
  vertex_array = new VertexArray(shader_program, attributes);

  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

initialize();