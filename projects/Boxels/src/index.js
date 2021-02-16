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
  gl.clearColor(0, 0, 0, 1);
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
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
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
    //reads color if specified
    let r = 1;
    let g = 1;
    let b = 1;
    if (arr[i].indexOf("-R") != -1) {
      b = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-B"));
      arr[i] = arr[i].substring(0, arr[i].lastIndexOf("BO"));
      g = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-G"));
      arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
      r = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-R"));
      arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    }

    //reads dimensions
    let depth = arr[i].substring(arr[i].lastIndexOf(i+"-")+(i+"-").length);
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let height = arr[i].substring(arr[i].lastIndexOf(i+"-")+(i+"-").length);
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let width = arr[i].substring(arr[i].lastIndexOf(i+"-")+(i+"-").length);
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));

    //reads center
    let zCenter = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-Z"));
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let yCenter = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-Y"));
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));
    let xCenter = arr[i].substring(arr[i].lastIndexOf("BOX-"+i+"-")+("BOX-"+i+"-").length,arr[i].lastIndexOf("-X"));
    arr[i] = arr[i].substring(0, arr[i].lastIndexOf("B"));

    //sets positions
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

    //sets indices
    indices = indices.concat(indicesTemplate);
    for (var j = indices.length-indicesTemplate.length; j < indices.length; j++)
    {
      indices[j] += i*24;
    }

    //sets colors
    colors = colors.concat(colorsTemplate);
    for (var j = colors.length-colorsTemplate.length; j < colors.length; j++)
    {
      if(j%3 == 0) {
        colors[j] = colors[j]*r;
      }
      if(j%3 == 1) {
        colors[j] = colors[j]*g;
      }
      if(j%3 == 2) {
        colors[j] = colors[j]*b;
      }
    }

    //sets normals
    normals = normals.concat(normalsTemplate);

    console.log(r);
    console.log(g);
    console.log(b);
    console.log("asdf");
    console.log(depth);
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

  modelToWorld = Matrix4.scale([.1,.1,.1]);
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

/*
BOX-0-1.2-X    BOX-0-2.3-Y    BOX-0--4.5-Z      BOX-0-0.5   BOX-0-0.25   BOX-0-0.5  BOX-0-0.2-R  BOX-0-0.5-G  BOX-0-0.9-B
BOX-1-0-X      BOX-1-0-Y      BOX-1-0-Z         BOX-1-1     BOX-1-1      BOX-1-1
//space invaders
BOX-0-0-X      BOX-0-0-Y      BOX-0-0-Z      BOX-0-3     BOX-0-4      BOX-0-1     BOX-0-0.2-R   BOX-0-0.5-G   BOX-0-0.9-B
BOX-1-0-X      BOX-1--2-Y     BOX-1-0-Z      BOX-1-5     BOX-1-2      BOX-1-1     BOX-1-0.2-R   BOX-1-0.5-G   BOX-1-0.9-B
BOX-2-4-X      BOX-2-4-Y      BOX-2-0-Z      BOX-2-1     BOX-2-2      BOX-2-1     BOX-2-0.2-R   BOX-2-0.5-G   BOX-2-0.9-B
BOX-3--4-X     BOX-3-4-Y      BOX-3-0-Z      BOX-3-1     BOX-3-2      BOX-3-1     BOX-3-0.2-R   BOX-3-0.5-G   BOX-3-0.9-B
BOX-4-6-X      BOX-4-7-Y      BOX-4-0-Z      BOX-4-1     BOX-4-1      BOX-4-1     BOX-4-0.2-R   BOX-4-0.5-G   BOX-4-0.9-B
BOX-5--6-X     BOX-5-7-Y      BOX-5-0-Z      BOX-5-1     BOX-5-1      BOX-5-1     BOX-5-0.2-R   BOX-5-0.5-G   BOX-5-0.9-B
BOX-6-6-X      BOX-6--1-Y     BOX-6-0-Z      BOX-6-1     BOX-6-5      BOX-6-1     BOX-6-0.2-R   BOX-6-0.5-G   BOX-6-0.9-B
BOX-7--6-X     BOX-7--1-Y     BOX-7-0-Z      BOX-7-1     BOX-7-5      BOX-7-1     BOX-7-0.2-R   BOX-7-0.5-G   BOX-7-0.9-B
BOX-8-3-X      BOX-8--7-Y     BOX-8-0-Z      BOX-8-2     BOX-8-1      BOX-8-1     BOX-8-0.2-R   BOX-8-0.5-G   BOX-8-0.9-B
BOX-9--3-X     BOX-9--7-Y     BOX-9-0-Z      BOX-9-2     BOX-9-1      BOX-9-1     BOX-9-0.2-R   BOX-9-0.5-G   BOX-9-0.9-B
BOX-10-8-X     BOX-10-0-Y     BOX-10-0-Z     BOX-10-1    BOX-10-2     BOX-10-1    BOX-10-0.2-R  BOX-10-0.5-G  BOX-10-0.9-B
BOX-11--8-X    BOX-11-0-Y     BOX-11-0-Z     BOX-11-1    BOX-11-2     BOX-11-1    BOX-11-0.2-R  BOX-11-0.5-G  BOX-11-0.9-B
BOX-12-10-X    BOX-12--3-Y    BOX-12-0-Z     BOX-12-1    BOX-12-3     BOX-12-1    BOX-12-0.2-R  BOX-12-0.5-G  BOX-12-0.9-B
BOX-13--10-X   BOX-13--3-Y    BOX-13-0-Z     BOX-13-1    BOX-13-3     BOX-13-1    BOX-13-0.2-R  BOX-13-0.5-G  BOX-13-0.9-B
//loz
BOX-0-0-X      BOX-0-0-Y      BOX-0-0-Z      BOX-0-4     BOX-0-1      BOX-0-1     BOX-0-0.98-R  BOX-0-0.6-G   BOX-0-0.3-B
BOX-1-0-X      BOX-1-4-Y      BOX-1-0-Z      BOX-1-10    BOX-1-1      BOX-1-1     BOX-1-0.98-R  BOX-1-0.6-G   BOX-1-0.3-B
BOX-2-4-X      BOX-2-2-Y      BOX-2-0-Z      BOX-2-2     BOX-2-1      BOX-2-1     BOX-2-0.98-R  BOX-2-0.6-G   BOX-2-0.3-B
BOX-3--4-X     BOX-3-2-Y      BOX-3-0-Z      BOX-3-2     BOX-3-1      BOX-3-1     BOX-3-0.98-R  BOX-3-0.6-G   BOX-3-0.3-B
BOX-4-0-X      BOX-4-7-Y      BOX-4-0-Z      BOX-4-2     BOX-4-2      BOX-4-1     BOX-4-0.98-R  BOX-4-0.6-G   BOX-4-0.3-B
BOX-5-5-X      BOX-5-7-Y      BOX-5-0-Z      BOX-5-1     BOX-5-2      BOX-5-1     BOX-5-0.98-R  BOX-5-0.6-G   BOX-5-0.3-B
BOX-6--5-X     BOX-6-7-Y      BOX-6-0-Z      BOX-6-1     BOX-6-2      BOX-6-1     BOX-6-0.98-R  BOX-6-0.6-G   BOX-6-0.3-B
BOX-7-9-X      BOX-7-7-Y      BOX-7-0-Z      BOX-7-1     BOX-7-2      BOX-7-1     BOX-7-0.98-R  BOX-7-0.6-G   BOX-7-0.3-B
BOX-8--9-X     BOX-8-7-Y      BOX-8-0-Z      BOX-8-1     BOX-8-2      BOX-8-1     BOX-8-0.98-R  BOX-8-0.6-G   BOX-8-0.3-B
BOX-9-11-X     BOX-9-9-Y      BOX-9-0-Z      BOX-9-1     BOX-9-4      BOX-9-1     BOX-9-0.98-R  BOX-9-0.6-G   BOX-9-0.3-B
BOX-10--11-X   BOX-10-9-Y     BOX-10-0-Z     BOX-10-1    BOX-10-4     BOX-10-1    BOX-10-0.98-R BOX-10-0.6-G  BOX-10-0.3-B
BOX-11--3-X    BOX-11--7-Y    BOX-11-0-Z     BOX-11-1    BOX-11-4     BOX-11-1    BOX-11-0.98-R BOX-11-0.6-G  BOX-11-0.3-B
BOX-12--11-X   BOX-12--5-Y    BOX-12-0-Z     BOX-12-1    BOX-12-4     BOX-12-1    BOX-12-0.98-R BOX-12-0.6-G  BOX-12-0.3-B
BOX-13--11-X   BOX-13--4-Y    BOX-13-0-Z     BOX-13-3    BOX-13-1     BOX-13-1    BOX-13-0.98-R BOX-13-0.6-G  BOX-13-0.3-B
BOX-14--9-X    BOX-14--12-Y   BOX-14-0-Z     BOX-14-5    BOX-14-1     BOX-14-1    BOX-14-0.98-R BOX-14-0.6-G  BOX-14-0.3-B
BOX-15-7-X     BOX-15--6-Y    BOX-15-0-Z     BOX-15-1    BOX-15-1     BOX-15-1    BOX-15-0.98-R BOX-15-0.6-G  BOX-15-0.3-B
BOX-16-9-X     BOX-16--6-Y    BOX-16-0-Z     BOX-16-1    BOX-16-3     BOX-16-1    BOX-16-0.98-R BOX-16-0.6-G  BOX-16-0.3-B
BOX-17-11-X    BOX-17--7-Y    BOX-17-0-Z     BOX-17-1    BOX-17-4     BOX-17-1    BOX-17-0.98-R BOX-17-0.6-G  BOX-17-0.3-B
BOX-18-13-X    BOX-18--7-Y    BOX-18-0-Z     BOX-18-1    BOX-18-2     BOX-18-1    BOX-18-0.98-R BOX-18-0.6-G  BOX-18-0.3-B
BOX-19-0-X     BOX-19-2-Y     BOX-19-0-Z     BOX-19-2    BOX-19-1     BOX-19-1    BOX-19-0.6-R  BOX-19-0.26-G BOX-19-0-B
BOX-20-3-X     BOX-20-6-Y     BOX-20-0-Z     BOX-20-1    BOX-20-1     BOX-20-1    BOX-20-0.6-R  BOX-20-0.26-G BOX-20-0-B
BOX-21--3-X    BOX-21-6-Y     BOX-21-0-Z     BOX-21-1    BOX-21-1     BOX-21-1    BOX-21-0.6-R  BOX-21-0.26-G BOX-21-0-B
BOX-22-7-X     BOX-22-8-Y     BOX-22-0-Z     BOX-22-1    BOX-22-3     BOX-22-1    BOX-22-0.6-R  BOX-22-0.26-G BOX-22-0-B
BOX-23--7-X    BOX-23-8-Y     BOX-23-0-Z     BOX-23-1    BOX-23-3     BOX-23-1    BOX-23-0.6-R  BOX-23-0.26-G BOX-23-0-B
BOX-24-0-X     BOX-24-11-Y    BOX-24-0-Z     BOX-24-6    BOX-24-2     BOX-24-1    BOX-24-0.6-R  BOX-24-0.26-G BOX-24-0-B
BOX-25--9-X    BOX-25-0-Y     BOX-25-0-Z     BOX-25-5    BOX-25-1     BOX-25-1    BOX-25-0.6-R  BOX-25-0.26-G BOX-25-0-B
BOX-26--6-X    BOX-26--2-Y    BOX-26-0-Z     BOX-26-4    BOX-26-1     BOX-26-1    BOX-26-0.6-R  BOX-26-0.26-G BOX-26-0-B
BOX-27--14-X   BOX-27--2-Y    BOX-27-0-Z     BOX-27-2    BOX-27-1     BOX-27-1    BOX-27-0.6-R  BOX-27-0.26-G BOX-27-0-B
BOX-28--6-X    BOX-28--4-Y    BOX-28-0-Z     BOX-28-2    BOX-28-1     BOX-28-1    BOX-28-0.6-R  BOX-28-0.26-G BOX-28-0-B
BOX-29--7-X    BOX-29--7-Y    BOX-29-0-Z     BOX-29-3    BOX-29-2     BOX-29-1    BOX-29-0.6-R  BOX-29-0.26-G BOX-29-0-B
BOX-30--8-X    BOX-30--10-Y   BOX-30-0-Z     BOX-30-4    BOX-30-1     BOX-30-1    BOX-30-0.6-R  BOX-30-0.26-G BOX-30-0-B
BOX-31--15-X   BOX-31--7-Y    BOX-31-0-Z     BOX-31-1    BOX-31-4     BOX-31-1    BOX-31-0.6-R  BOX-31-0.26-G BOX-31-0-B
BOX-32--13-X   BOX-32--8-Y    BOX-32-0-Z     BOX-32-1    BOX-32-3     BOX-32-1    BOX-32-0.6-R  BOX-32-0.26-G BOX-32-0-B
BOX-33--3-X    BOX-33--12-Y   BOX-33-0-Z     BOX-33-1    BOX-33-1     BOX-33-1    BOX-33-0.6-R  BOX-33-0.26-G BOX-33-0-B
BOX-34--5-X    BOX-34--15-Y   BOX-34-0-Z     BOX-34-3    BOX-34-2     BOX-34-1    BOX-34-0.6-R  BOX-34-0.26-G BOX-34-0-B
BOX-35-0-X     BOX-35--6-Y    BOX-35-0-Z     BOX-35-2    BOX-35-1     BOX-35-1    BOX-35-0.6-R  BOX-35-0.26-G BOX-35-0-B
BOX-36-0-X     BOX-36--10-Y   BOX-36-0-Z     BOX-36-2    BOX-36-1     BOX-36-1    BOX-36-0.6-R  BOX-36-0.26-G BOX-36-0-B
BOX-37-4-X     BOX-37--8-Y    BOX-37-0-Z     BOX-37-4    BOX-37-1     BOX-37-1    BOX-37-0.6-R  BOX-37-0.26-G BOX-37-0-B
BOX-38-5-X     BOX-38--14-Y   BOX-38-0-Z     BOX-38-3    BOX-38-1     BOX-38-1    BOX-38-0.6-R  BOX-38-0.26-G BOX-38-0-B
BOX-39-9-X     BOX-39--2-Y    BOX-39-0-Z     BOX-39-1    BOX-39-1     BOX-39-1    BOX-39-0.6-R  BOX-39-0.26-G BOX-39-0-B
BOX-40-11-X    BOX-40-1-Y     BOX-40-0-Z     BOX-40-1    BOX-40-4     BOX-40-1    BOX-40-0.6-R  BOX-40-0.26-G BOX-40-0-B
BOX-41-13-X    BOX-41--2-Y    BOX-41-0-Z     BOX-41-1    BOX-41-3     BOX-41-1    BOX-41-0.6-R  BOX-41-0.26-G BOX-41-0-B
BOX-42--8-X    BOX-42-2-Y     BOX-42-0-Z     BOX-42-2    BOX-42-1     BOX-42-1    BOX-42-0-R    BOX-42-0.71-G BOX-42-0.02-B
BOX-43-3-X     BOX-43-8-Y     BOX-43-0-Z     BOX-43-1    BOX-43-1     BOX-43-1    BOX-43-0-R    BOX-43-0.71-G BOX-43-0.02-B
BOX-44--3-X    BOX-44-8-Y     BOX-44-0-Z     BOX-44-1    BOX-44-1     BOX-44-1    BOX-44-0-R    BOX-44-0.71-G BOX-44-0.02-B
BOX-45-7-X     BOX-45-13-Y    BOX-45-0-Z     BOX-45-1    BOX-45-2     BOX-45-1    BOX-45-0-R    BOX-45-0.71-G BOX-45-0.02-B
BOX-46--7-X    BOX-46-13-Y    BOX-46-0-Z     BOX-46-1    BOX-46-2     BOX-46-1    BOX-46-0-R    BOX-46-0.71-G BOX-46-0.02-B
BOX-47-0-X     BOX-47-15-Y    BOX-47-0-Z     BOX-47-6    BOX-47-2     BOX-47-1    BOX-47-0-R    BOX-47-0.71-G BOX-47-0.02-B
BOX-48--1-X    BOX-48--8-Y    BOX-48-0-Z     BOX-48-1    BOX-48-1     BOX-48-1    BOX-48-0-R    BOX-48-0.71-G BOX-48-0.02-B
BOX-49-6-X     BOX-49--10-Y   BOX-49-0-Z     BOX-49-4    BOX-49-1     BOX-49-1    BOX-49-0-R    BOX-49-0.71-G BOX-49-0.02-B
BOX-50-3-X     BOX-50--12-Y   BOX-50-0-Z     BOX-50-5    BOX-50-1     BOX-50-1    BOX-50-0-R    BOX-50-0.71-G BOX-50-0.02-B
BOX-51-8-X     BOX-51-2-Y     BOX-51-0-Z     BOX-51-2    BOX-51-1     BOX-51-1    BOX-51-0-R    BOX-51-0.71-G BOX-51-0.02-B
BOX-52-7-X     BOX-52-0-Y     BOX-52-0-Z     BOX-52-3    BOX-52-1     BOX-52-1    BOX-52-0-R    BOX-52-0.71-G BOX-52-0.02-B
BOX-53-3-X     BOX-53--3-Y    BOX-53-0-Z     BOX-53-5    BOX-53-2     BOX-53-1    BOX-53-0-R    BOX-53-0.71-G BOX-53-0.02-B
BOX-54-4-X     BOX-54--6-Y    BOX-54-0-Z     BOX-54-2    BOX-54-1     BOX-54-1    BOX-54-0-R    BOX-54-0.71-G BOX-54-0.02-B
*/
