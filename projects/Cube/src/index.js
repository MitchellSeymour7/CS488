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
let prevClientX;
let prevClientY;
let timeRotation = 0;

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
  vertexArray.drawIndexed(gl.LINE_LOOP);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

function cube() {
  vertexArray?.destroy();

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
    0, 0, 1,
    1, 0, 1,
    0, 1, 1,
    1, 1, 1,

    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    1, 1, 0,
  ];
  const indices = [
    0, 2, 1,
    3, 5, 7,
    4, 6, 0,
    2, 3, 6,
    7, 1, 0,
    5, 4,
  ];
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', positions.length/3, 3, positions);
  attributes.addAttribute('color', positions.length/3, 3, colors);
  attributes.addIndices(indices);
  vertexArray = new VertexArray(shaderProgram, attributes);
}

async function initialize() {
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

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  cube();

  transform = Matrix4.identity();

  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('mousemove', event => {
    if(prevClientX == undefined) {
      prevClientX = event.clientX;
      prevClientY = event.clientY;
    }
    let rotationX = (event.clientX-prevClientX)/800;
    let rotationY = (event.clientY-prevClientY)/800;
    transform = Matrix4.rotateXYZ(transform,rotationX,rotationY,0);
    prevClientX = event.clientX;  
    prevClientY = event.clientY;
    
    render();
  });
  setInterval(() => {
    timeRotation += 0.01;
    timeRotation = timeRotation;
    let x = (Math.sin(timeRotation))/100+.01;
    let y = (Math.sin(timeRotation+2))/100;
    let z = ((Math.sin(timeRotation+1))-0.3)/100;
    console.log(prevClientX);
    transform = Matrix4.rotateXYZ(transform,x,y,z);
    render();
  }, 15);
  
  onSizeChanged();
}

initialize();