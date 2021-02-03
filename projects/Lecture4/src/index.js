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
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE)

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('transform', transform);
  vertexArray.bind();
  vertexArray.drawIndexed(gl.TRIANGLE_STRIP);
  //vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

async function initialize() {
  transform = Matrix4.scale([1,1,1]);

  const vertexSource = `
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
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,

    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
  ];

  const colors = [
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    1, 1, 0,

    0, 0, 1,
    1, 0, 1,
    0, 1, 1,
    1, 1, 1,
  ];
  const indicesFan = [
    0, 2, 1,
    3, 5, 7,
    4, 6, 0,
    2, 3, 6,
    7, 1, 0,
    5, 4,
  ];
  transform = Matrix4.identity();
  window.addEventListener('mousemove', event => {
    console.log(Matrix4.rotateX(event.clientX/200));
    console.log(Matrix4.multiplyMatrix4(Matrix4.rotateX(1),Matrix4.rotateY(1)));
    transform = Matrix4.multiplyMatrix4(Matrix4.rotateX(event.clientX/200),Matrix4.rotateY(event.clientY/200));
    render();
  })

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 4, 3, positions);
  attributes.addAttribute('color', 4, 3, colors);
  //attributes.addIndices(indices);
  attributes.addIndices(indicesFan);
  vertexArray = new VertexArray(shaderProgram, attributes);

  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

initialize();