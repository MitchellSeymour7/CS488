import {VertexArray} from './VertexArray';
import {VertexAttributes} from './VertexAttributes';
import {ShaderProgram} from './ShaderProgram';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
console.log(window.gl);

let vertexArray;
let shaderProgram;
let prevClientX = 1;
let prevClientY = 1;
let rotationX = 0;
let rotationY = 0;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);

  shaderProgram.bind();
  shaderProgram.setUniform1f('radiansX', rotationX);
  shaderProgram.setUniform1f('radiansY', rotationY);
  vertexArray.bind();
  vertexArray.drawSequence(gl.TRIANGLE_STRIP);
  vertexArray.drawSequence(gl.LINE_LOOP);
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
    -0.5,  0.5,  0.5, 
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
     
     0.5,  -0.5, -0.5,
     0.5,   0.5, -0.5,
    -0.5,  -0.5, -0.5,
    -0.5,   0.5, -0.5,

    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    
    -0.5, 0.5, -0.5,
     0.5, 0.5, 0.5,
     0.5, 0.5, -0.5,

     0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
  
  ];

  const colors = [
    0, 0, 1,
    0, 1, 1,
    1, 0, 1,
    1, 1, 1,

    1, 0, 0,
    1, 1, 0,
    0, 0, 0,
    0, 1, 0,

    0, 0, 1,
    0, 1, 1,

    0, 1, 0,
    1, 1, 1,
    1, 1, 0,

    1, 0, 0,
    0, 0, 0,
    1, 0, 1,
    0, 0, 1,
  ];
  
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', positions.length/3, 3, positions);
  attributes.addAttribute('color', positions.length/3, 3, colors);
  vertexArray = new VertexArray(shaderProgram, attributes);
}

async function initialize() {
  const vertexSource = `
  uniform float radiansX;
  uniform float radiansY;

  in vec3 position;
  in vec3 color;

  out vec3 fcolor;

  void main() {
    vec3 pos2 = vec3(
      cos(radiansX) * position.x - sin(radiansX) * position.z,
      position.y,
      sin(radiansX) * position.x + cos(radiansX) * position.z    
    );
    vec3 pos3 = vec3(
      pos2.x,
      sin(radiansY) * pos2.z + cos(radiansY) * pos2.y,
      cos(radiansY) * pos2.z - sin(radiansY) * pos2.y  
    );
    gl_Position = vec4(pos3,1);
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

  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('mousemove', event => {
    rotationX += (event.clientX-prevClientX)/400;
    prevClientX = event.clientX;
    rotationY += (event.clientY-prevClientY)/400;
    prevClientY = event.clientY;
    render();
  });
  /*window.addEventListener('timeupdate', event => {
    rotationX = event.timeStamp;
    window.timeStamp
    render();
  });*/
  setInterval(() => {
    rotationX += 0.01;
    rotationY += 0.01;
    render();
  }, 10);
  
  onSizeChanged();
}

initialize();