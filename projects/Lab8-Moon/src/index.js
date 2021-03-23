import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';

import {Matrix4} from './Matrix4';
import {Vector3} from './Vector3';
import {Vector4} from './Vector4';
import {Camera} from './camera';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let clipFromEye;
let isStillAnimating = false;
let camera;
let vertexObjects = [];

let transform;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);  

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('worldFromModel', transform);
  shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  shaderProgram.setUniformMatrix4('eyeFromWorld', camera.matrix);

  // array.entries() -> [[0, value0], [1, value1], [2, value2]]
  // for (let [i, object] of array.entries()) {}
  
  for (let [i, object] of vertexObjects.entries()) {
    shaderProgram.setUniformMatrix4('objPosition', object.matrix ? object.matrix : Matrix4.identity());
    shaderProgram.setUniform1i('image', i);
    object.vertex.bind();
    object.vertex.drawIndexed(gl.TRIANGLES);
    object.vertex.unbind();
  }
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

function generateSphere(nlatitudes, nlongitudes, outerRadius) {
  const seeds = [];
  const seedNormals = [];
  
  const scale = (outerRadius)/2;
  
  for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
  {
    const radians = (ilatitude / (nlatitudes-1) * (Math.PI))-(Math.PI/2);
    const seed = [(scale * Math.cos(radians)), scale * Math.sin(radians), 0, 1];
    const normal = [Math.cos(radians), Math.sin(radians), 0, 0];
    seedNormals.push(normal);
    seeds.push(seed);
    }

  const positions = [];
  const normals = [];
  const textureCoords = [];

  for(let ilongitude = 0; ilongitude <= nlongitudes; ilongitude++)
  {
    const degrees = ilongitude / nlongitudes * 360;
    const rotation = Matrix4.rotateY(degrees);
    for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
    {
      const position = rotation.multiplyVector4Array(seeds[ilatitude]);
      const normal = rotation.multiplyVector4Array(seedNormals[ilatitude]);
      positions.push(position[0], position[1], position[2]);
      normals.push(normal[0], normal[1], normal[2]);
      // push texcoords
      textureCoords.push(ilongitude / nlongitudes, ilatitude / nlatitudes);
    } 
  }

  const indices = [];
  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const iNextLongitude = (ilongitude + 1);
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
  return {positions, normals, indices,textureCoords};
  //return generateTorus(nlatitudes, nlongitudes, outerRadius, -outerRadius);
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

function generateRectangle(x,y) {
  const positions = [
      -x, -y, 0,
      -x, y, 0,
      x, -y, 0,
      x, y, 0 ];
  const normals = [
      1,1,1,
      1,1,1,
      1,1,1,
      1,1,1,
  ];
  const indices = [
      0,1,2,
      3,2,1,
  ];

  const textureCoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 1,
  ]
  return {positions, normals, indices, textureCoords};
}


async function initialize() {
  transform = Matrix4.identity();
  camera = new Camera(new Vector3(15,2,0),new Vector3(0,0,0),new Vector3(0,1,0));

  await loadTexture("tileable_grass_00.png", gl.TEXTURE0);
  await loadTexture("lroc_color_poles_1k.jpg", gl.TEXTURE1);

  /*
  //const {positions, normals, indices} = generateTorus(50, 50, 9, 3);
  const {positions, normals, indices} = generateSphere(50, 50, 9);

  const texture = loadTexture('lroc_color_poles_1k.jpg');
  console.log(texture);
  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  
  const texcoords = [
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  attributes.addAttribute('texcoords', texcoords/2, 2, texcoords);
  attributes.addIndices(indices);
  */
  

  const vertexSource = `
  uniform mat4 worldFromModel ;
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromWorld;
  in vec3 position;
  in vec3 normal;
  in vec2 texcoords;
    
  out vec2 ftexcoords;
  out vec3 fnormal;
  
  void main() {
    // gl_Position = clipFromEye * worldFromModel * vec4(position, 1.0);

    gl_Position = clipFromEye * eyeFromWorld * worldFromModel  * vec4(position, 1.0);

    fnormal = (worldFromModel  * vec4(normal, 0)).xyz;
    ftexcoords = texcoords;
  }
  `;
  
  const fragmentSource = `
  in vec3 fnormal;
  out vec4 fragmentColor;

  in vec2 ftexcoords;
  uniform sampler2D image;

  const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));
  
  void main() {
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, light_direction));
    //fragmentColor = vec4(vec3(litness), 1.0);
    vec3 albedo = texture(image, ftexcoords).rgb;
    fragmentColor = vec4(litness*albedo, 1.0);
    //fragmentColor = vec4(ftexcoords, 0.0, 1.0);
  }
  `;

  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);

  addObject(generateRectangle(3,3),Matrix4.rotateX(90).multiplyMatrix4(Matrix4.translate(1,1,1)))

  addObject(generateSphere(20,20,2),Matrix4.translate(1,1,1), new Vector3(0.1,0.2,0.3))

  //pair the shader program and the vertex data/attributes
  //vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

async function loadTexture(url, textureUnit = gl.TEXTURE0) {
  const image = new Image();
  image.src = url;
  await image.decode();

  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  return texture;
}

window.addEventListener('keydown', event => {
  if (event.key === 'a') {
    camera.strafe(-0.1);
    render();
  } else if (event.key === 'd') {
    camera.strafe(0.1);
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


function addObject(objectToAdd, transform=Matrix4.identity(), color=new Vector3(Math.random())) {
  let attributes = new VertexAttributes();
  let colors = []
  for (let i = 0; i < objectToAdd.positions.length; i+=3) {
      let output = transform.multiplyVector4(new Vector4(objectToAdd.positions[i],objectToAdd.positions[i+1],objectToAdd.positions[i+2],1));
      objectToAdd.positions[i] = output.x;
      objectToAdd.positions[i+1] = output.y;
      objectToAdd.positions[i+2] = output.z;
      colors.push(color.x,color.y,color.z);
  }

  //attributes.addAttribute('color', colors.length / 3, 3, colors);
  attributes.addAttribute('position', objectToAdd.positions.length / 3, 3, objectToAdd.positions);
  attributes.addAttribute('normal', objectToAdd.positions.length / 3, 3, objectToAdd.normals);
  attributes.addIndices(objectToAdd.indices);
  console.log(objectToAdd.textureCoords);
  attributes.addAttribute('texcoords', objectToAdd.textureCoords.length / 2, 2, objectToAdd.textureCoords); 

  let vertexArray = new VertexArray(shaderProgram, attributes);
  vertexObjects.push({vertex: vertexArray, matrix: Matrix4.identity()});

  
}

initialize();
