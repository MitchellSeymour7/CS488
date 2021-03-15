import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';

import {Matrix4} from './Matrix4';
import {Vector3} from './Vector3';
import {Camera} from './camera';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let clipFromEye;
let isStillAnimating = false;
let trackball;
let camera;

let transform;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('worldFromModel', transform);
  shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  shaderProgram.setUniformMatrix4('eyeFromWorld', camera.matrix);
  vertexArray.bind();
  vertexArray.drawIndexed(gl.LINE_LOOP);
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
    right = 9;
    top = right / aspectRatio;
  } else {
    top = 9;
    right = top * aspectRatio;
  }

  clipFromEye = Matrix4.ortho(-right, right, -top, top, -1000, 1000);
  clipFromEye = Matrix4.fovPerspective(45, aspectRatio, 0.01, 1000);

  render();
}

function generateTorus (nlatitudes, nlongitudes, outerRadius, innerRadius) {
  const seeds = [];
  const seedNormals = [];

  const scale = (outerRadius-innerRadius)/2;
  const translate = (outerRadius-innerRadius)/2+innerRadius;
  
  for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
  {
    const radians = ilatitude / (nlatitudes) * (2 * Math.PI);
    const seed = [translate + (scale * Math.cos(radians)), scale * Math.sin(radians), 0, 1];
    const normal = [Math.cos(radians), Math.sin(radians), 0, 0];
    seedNormals.push(normal);
    seeds.push(seed);
    }

  const positions = [];
  const normals = [];

  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const degrees = ilongitude / nlongitudes * 360;
    const rotation = Matrix4.rotateY(degrees);
    for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
    {
      const position = rotation.multiplyVector4Array(seeds[ilatitude]);
      const normal = rotation.multiplyVector4Array(seedNormals[ilatitude]);
      positions.push(position[0], position[1], position[2]);
      normals.push(normal[0], normal[1], normal[2]);
    } 
  }

  const indices = [];
  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const iNextLongitude = (ilongitude + 1) % nlongitudes;
    for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
    {
      const iNextLatitude = (ilatitude + 1) % nlatitudes;
      // Bottom-left triangle
      indices.push(
        ilongitude * nlatitudes + ilatitude,
        ilongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + ilatitude,
      )

      // Top-right triangle
      indices.push(
        ilongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + ilatitude,
      )
    }
  }

  return {positions, normals, indices};
}

function generateGrid () {
  let gridWidth = 100
  let scale = 40;
  const positions = [];
  const indices = [];
  for(let i = 0; i < gridWidth; i++)
  {
    positions.push((i-(gridWidth/2))*scale,0,(gridWidth/2)*scale);
    positions.push((i-(gridWidth/2))*scale,0,(-gridWidth/2)*scale);
  }
  for(let i = 0; i+4 < gridWidth*2; i+= 4)
  {
    indices.push(i,i+1,i+2,i+3);
  }
  return {positions, indices};
}


async function initialize() {
  //trackball = new Trackball();
  transform = Matrix4.identity();
  camera = new Camera(new Vector3(15,2,0),new Vector3(0,0,0),new Vector3(0,1,0))
  
  const {positions, normals, indices} = generateTorus(50, 50, 9, 3);
  //const {positions, indices} = generateGrid();
  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  attributes.addIndices(indices);
  
  const vertexSource = `
  uniform mat4 worldFromModel ;
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromWorld;
  in vec3 position;
  in vec3 normal;

  out vec3 fnormal;
  
  void main() {
    // gl_Position = clipFromEye * worldFromModel * vec4(position, 1.0);

    gl_Position = clipFromEye * eyeFromWorld * worldFromModel  * vec4(position, 1.0);

    fnormal = (worldFromModel  * vec4(normal, 0)).xyz;
  }
  `;
  
  const fragmentSource = `
  in vec3 fnormal;
  out vec4 fragmentColor;

  const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));
  
  void main() {
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, light_direction));
    fragmentColor = vec4(vec3(litness), 1.0);
  }
  `;

  
  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  //pair the shader program and the vertex data/attributes
  vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('mousedown', onMouseDown);
  onSizeChanged();
}



function onMouseDown(event) {
  if (event.button === 0) {
    if(!isStillAnimating) {
      isStillAnimating = true;
      requestAnimationFrame(animateFrame);
    }
    else {
      isStillAnimating = false;
    }
  }
}

function animateFrame(timestep) {
  // update state
  // degrees * speed * howMuchTimeHasElapsed
  transform = transform.multiplyMatrix4(Matrix4.rotateZ(.0001*timestep));
  //
  render();
  if (isStillAnimating) {
    requestAnimationFrame(animateFrame);
  } 
}

window.addEventListener('keydown', event => {
  if (event.key === 'a') {
    camera.strafe(-0.1);
    render();
  } else if (event.key === 'd') {
    camera.strafe(0.1);
    //console.log(camera);
    render();
  } else if (event.key === 'w') {
    camera.advance(0.1);
    render();
  } else if (event.key === 's') {
    camera.advance(-0.1);
    render();
  }
  render();
});

window.addEventListener('mousedown', () => {
  document.body.requestPointerLock();
});

window.addEventListener('mousemove', event => {
  if (document.pointerLockElement) {
    camera.yaw(-event.movementX * 0.01);
    camera.pitch(-event.movementY * 0.01);
    render();
  }
});

initialize();