import {VertexArray} from './VertexArray';
import {VertexAttributes} from './VertexAttributes';
import {ShaderProgram} from './ShaderProgram';

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
  
  

  shaderProgram.bind();
  shaderProgram.setUniform1f('radians', 3.14);
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
  //transform = Matrix.scale(2, 0.5, 1);
  // transform = Matrix.translate(0.3, -0.5);
  // transform = Matrix.rotateZ(45);

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

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 3, 3, positions);
  attributes.addAttribute('color', 3, 3, colors);
  vertexArray = new VertexArray(shaderProgram, attributes);

  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

initialize();