import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {Matrix4} from './Matrix4';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let transform;
let worldToClip;

function render() {
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.viewport(0, 0, canvas.width, canvas.height);


  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('transform', transform);
  shaderProgram.setUniformMatrix4('worldToClip', worldToClip);
  vertexArray.bind();
  vertexArray.drawIndexed(gl.TRIANGLE_STRIP);
  //vertexArray.drawIndexed(gl.TRIANGLES);
  //vertexArray.drawIndexed(gl.LINE_LOOP);
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
    right = 3;
    top = right / aspectRatio;
  } else {
    top = 3;
    right = top * aspectRatio;
  }

  worldToClip = Matrix4.ortho(-right, right, -top, top, -10, 10);

  render();
}

async function initialize() {
  transform = Matrix4.identity();

  const positions = [
     0, -2, -2,
     0, -2, 2,
     2,  2, 0,
    -2,  2, 0,
  ];
  
  const colors = [
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
  ];
  
  const faces = [
    0, 1, 2, 3,
    0, 1,

    //0,1,2,
    //1,2,3,
    //2,3,0,
    //3,0,1,
  ];
  
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 4, 3, positions);
  attributes.addAttribute('color', 4, 3, colors);
  attributes.addIndices(faces);
  
  //determines where to place each vertex
  //will be run on each vertex
  const vertexSource = `
  uniform mat4 transform;
  uniform mat4 worldToClip;
  in vec3 position;
  in vec3 color;
  out vec3 fcolor;
  
  void main() {
    gl_Position = worldToClip * transform * vec4(position, 1.0);
    fcolor = color;
  }
  `;
  
  //determines what color to make each vertex
  //will be run on each "triangle" of verticies
  const fragmentSource = `
  in vec3 fcolor;
  out vec4 fragmentColor;
  
  void main() {
    fragmentColor = vec4(fcolor, 1.0);
  }
  `;
  
  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  //pair the shader program and the vertex data/attributes
  vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('keydown', event => {
    let rotationAmount = 0.1;

    if(event.key === 'ArrowRight')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateY(rotationAmount));
    }
    if(event.key === 'ArrowLeft')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateY(-rotationAmount));
    }
    if(event.key === 'ArrowUp')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateX(rotationAmount));
    }
    if(event.key === 'ArrowDown')
    {
      transform = transform.multiplyMatrix4(Matrix4.rotateX(-rotationAmount));
    }
    render();
  });
  onSizeChanged();
}

initialize();