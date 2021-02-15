import {VertexArray} from './VertexArray';
import {VertexAttributes} from './VertexAttributes';
import {ShaderProgram} from './ShaderProgram';
import {Matrix4} from './Matrix4';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
console.log(window.gl);

let vertexArray;
let shaderProgram;
let modelToWorld;
let worldToClip;

let prevClientX;
let prevClientY;

let file;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('modelToWorld', modelToWorld);
  shaderProgram.setUniformMatrix4('worldToClip', worldToClip);

  vertexArray.bind();
  vertexArray.drawIndexed(gl.TRIANGLES);
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

function cube() {
  vertexArray?.destroy();

  const positionsTemplate = [   
    //front face
    -1, -1,  1,  1, -1,  1, -1,  1,  1,  1,  1,  1,
    //back face
    -1, -1, -1,  1, -1, -1, -1,  1, -1,  1,  1, -1,
    //left face
    -1, -1,  1, -1, -1, -1, -1,  1,  1, -1,  1, -1,
    // right face
     1, -1,  1,  1, -1, -1,  1,  1,  1,  1,  1, -1,
    // top face
    -1,  1,  1,  1,  1,  1, -1,  1, -1,  1,  1, -1,
    // bottom face
    -1, -1,  1,  1, -1,  1, -1, -1, -1,  1, -1, -1,
  ];    
  const colorsTemplate = [
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,

    1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,

    0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
  ];
  const indicesTemplate = [
    // front
     0,  1,  2,  1,  3,  2,
    // back
     4,  6,  5,  5,  6,  7,
    // left
     8, 10,  9,  9, 10, 11,
    // right
    12, 13, 14, 13, 15, 14,
    // top
    16, 17, 18, 17, 19, 18,
    // bottom
    20, 22, 21, 21, 22, 23,
  ];
  const normalsTemplate = [
    // front
     0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // back
     0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1,
    // left
    -1, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0, 0,
    // right
     1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // top
     0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // bottom
     0,-1, 0, 0,-1, 0, 0,-1, 0, 0,-1, 0,
  ];

  let positions = [];
  let indices = [];
  let colors = [];
  let normals = [];

  // loop for all cubes
  var arr = file.split("\n");
  for (var i = 0; i < arr.length; i++)
  {
    console.log(arr[i]);
    let depth = arr[i].substring(arr[i].lastIndexOf(i+"-")+(i+"-").length);
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let height = arr[i].substring(arr[i].lastIndexOf(i+"-")+(i+"-").length);
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let width = arr[i].substring(arr[i].lastIndexOf(i+"-")+(i+"-").length);
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));

    
    let zCenter = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-Z"));
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let yCenter = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-Y"));
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let xCenter = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-X"));
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));

    positions = positions.concat(positionsTemplate);
    for (var j = positions.length-positionsTemplate.length; j < positions.length; j++)
    {
      if(j%3 == 0) {
        positions[j] = positions[j]*width+parseFloat(xCenter);
      }
      if(j%3 == 1) {
        positions[j] = positions[j]*height+parseFloat(yCenter);
      }
      if(j%3 == 2) {
        positions[j] = positions[j]*depth+parseFloat(zCenter);
      }
    }

    indices = indices.concat(indicesTemplate);
    for (var j = indices.length-indicesTemplate.length; j < indices.length; j++)
    {
      indices[j] += i*24;
    }
    colors = colors.concat(colorsTemplate);
    normals = normals.concat(normalsTemplate);

    
    console.log(positions);
  }

  const attributes = new VertexAttributes();
  attributes.addAttribute('position', positions.length/3, 3, positions);
  attributes.addAttribute('color', positions.length/3, 3, colors);
  attributes.addAttribute('normal', normals.length/3, 3, normals);
  attributes.addIndices(indices);
  vertexArray = new VertexArray(shaderProgram, attributes);
}

async function initialize() {
  const vertexSource = `
  uniform mat4 modelToWorld;
  uniform mat4 worldToClip;

  in vec3 position;
  in vec3 color;
  in vec3 normal;

  out vec3 fnormal;
  out vec3 fcolor;

  void main() {
    gl_Position = worldToClip * modelToWorld * vec4(position, 1.0);
    gl_PointSize = 2.0; 
    fnormal = (modelToWorld * vec4(normal,0)).xyz;
    fcolor = color;
  }
  `;

  const fragmentSource = `
  const vec3 light_direction = normalize(vec3(.1,.1, 1.0));
  const vec3 albedo = vec3(0.0, 1.0, 1.0);

  in vec3 fnormal;
  in vec3 fcolor;
  out vec4 fragmentColor;
  

  void main() {
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, light_direction));
    //fragmentColor = vec4(albedo*litness, 1.0);
    fragmentColor = vec4(fcolor*litness, 1.0);
    //fragmentColor = vec4(fcolor, 1.0);
  }
  `;  

  file = await fetch("input.txt").then(response => response.text());
  console.log(file);

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  cube();

  modelToWorld = Matrix4.scale([1.5,1.5,1.5]);
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('keydown', event => {
    let rotationAmount = 0.1;

    if(event.key === 'ArrowRight')
    {
      modelToWorld = Matrix4.rotateXYZ(modelToWorld,0.0,-rotationAmount,0.0);
    }
    if(event.key === 'ArrowLeft')
    {
      modelToWorld = Matrix4.rotateXYZ(modelToWorld,0.0,rotationAmount,0.0);
    }
    if(event.key === 'ArrowUp')
    {
      modelToWorld = Matrix4.rotateXYZ(modelToWorld,-rotationAmount,0.0,0.0);
    }
    if(event.key === 'ArrowDown')
    {
      modelToWorld = Matrix4.rotateXYZ(modelToWorld,rotationAmount,0.0,0.0);
    }
    render();
  });
  window.addEventListener('mousemove', event => {
    if(prevClientX == undefined) {
      prevClientX = event.clientX;
      prevClientY = event.clientY;
    }
    let rotationX = (event.clientX-prevClientX)/800;
    let rotationY = (event.clientY-prevClientY)/800;
    modelToWorld = Matrix4.rotateXYZ(modelToWorld,rotationX,rotationY,0);
    prevClientX = event.clientX;  
    prevClientY = event.clientY;
    
    render();
  });
  
  onSizeChanged();
}

initialize();