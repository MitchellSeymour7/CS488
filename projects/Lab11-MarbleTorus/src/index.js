import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {Matrix4} from './Matrix4';
import {Vector3} from './Vector3';
import { Vector2 } from './Vector2';
import { Camera } from './Camera';
import {Trackball} from './Trackball';
import {Noise} from './Noise';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let isLeftMouseDown = false;
let clipFromEye;
let camera;
let trackball;
let texture;

let torusOuterRad = 4;
let torusInnerRad = 2;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  
  shaderProgram.bind();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_3D, texture);
  shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  shaderProgram.setUniformMatrix4('eyeFromModel', camera.matrix.multiplyMatrix4(trackball.rotation));
  shaderProgram.setUniform1i('marble', 0);
  shaderProgram.setUniform1f('outRad', torusOuterRad);

  vertexArray.bind();
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
    right = 5;
    top = right / aspectRatio;
  } else {
    top = 5;
    right = top * aspectRatio;
  }

  clipFromEye = Matrix4.ortho(-right, right, -top, top, -1000, 1000);

  trackball.setViewport(canvas.width, canvas.height);

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
      const position = rotation.multiplyVector4(seeds[ilatitude]);
      const normal = rotation.multiplyVector4(seedNormals[ilatitude]);
      positions.push(new Vector3(position.x, position.y, position.z));
      normals.push(new Vector3(normal.x, normal.y, normal.z));
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

/*
 * Helper function to deconstruct an array of Vector3 objects to a flat array.
 * Used to create positions and normals array for VertexAttributes object
 */
function vector3ArrayToFlatArray(vec3Array)
{
  let flatArray = [];
  for(let i = 0; i < vec3Array.length; i++)
  {
    const vec3 = vec3Array[i];
    flatArray.push(vec3.x, vec3.y, vec3.z);
  }
  return flatArray;
}

function generateNoise(width, height, depth) {
  const bytes = Noise.field3(new Vector3(width, height, depth), new Vector3(0.1, 0.1, 0.1), 3);
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_3D, texture);
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.R8, width, height, depth, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);

  gl.generateMipmap(gl.TEXTURE_3D);

  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT);

}

async function initialize() {

  trackball = new Trackball();

  camera = new Camera(new Vector3(0,0,100), new Vector3(0,0,0), new Vector3(0,1,0));

  generateNoise(128, 128, 128);
  
  const {positions, normals, indices} = generateTorus(50, 50, torusOuterRad, torusInnerRad);
  
  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, vector3ArrayToFlatArray(normals));
  attributes.addAttribute('position', positions / 3, 3, vector3ArrayToFlatArray(positions));
  attributes.addIndices(indices);
  
  const vertexSource = `
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromModel;
  in vec3 position;
  in vec3 normal;

  out vec3 fnormal;
  out vec3 fposition;
  out vec3 positionEye;
  
  void main() {
    gl_Position = clipFromEye * eyeFromModel * vec4(position, 1.0);
    fnormal = (eyeFromModel * vec4(normal, 0.0)).xyz;
    positionEye = (eyeFromModel * vec4(position, 1.0)).xyz; 
    fposition = position;
    }
  `;
  
  const fragmentSource = `
  precision highp sampler3D;
  
  in vec3 fnormal;
  in vec3 fposition;
  in vec3 positionEye;
  out vec4 fragmentColor;

  uniform sampler3D marble;
  uniform float outRad;


  const vec3 lightColor = vec3(1.0, 1.0, 1.0);
  const vec3 lightPosition = vec3(100.0);

  const float ambientWeight = 0.1;

  void main() {
    vec3 normal = normalize(fnormal);
    vec3 lightVector = normalize(lightPosition - positionEye);

    // Set albedo
    float shift = texture(marble, (fposition/(outRad*2.0))+.5).r * 20.0;

    float diagonality = ((fposition.x + fposition.y) * 5.0) + shift;
    vec3 albedo = vec3(abs(sin(diagonality)));
    // Diffuse
    float litness = max(0.0, dot(normal, lightVector));
    vec3 diffuse = litness * lightColor * (albedo-ambientWeight);

    // Ambient
    vec3 ambient = lightColor * ambientWeight;

    // Specular
    vec3 eyeVector = -normalize(positionEye);
    vec3 halfVector = normalize(lightVector + eyeVector);
    float specularity = max(0.0, dot(halfVector, normal));
    float shininess = 90.0;
    vec3 specular = vec3(1.0) * pow(specularity, shininess);

    vec3 rgb = (ambient + diffuse + specular);
    fragmentColor = vec4(rgb, 1.0);
  }
  `;

  
  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  //pair the shader program and the vertex data/attributes
  vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseDrag);
  window.addEventListener('mouseup', onMouseUp);
  onSizeChanged();
}

function onMouseDown(event) {
  if (event.button === 0) {
    isLeftMouseDown = true;
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.start(mousePixels);
  }
}

function onMouseDrag(event) {
  if (isLeftMouseDown) {
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.drag(mousePixels, 1);
    render();
  }
}

function onMouseUp(event) {
  if (isLeftMouseDown) {
    isLeftMouseDown = false;
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);

    const diff = trackball.end(mousePixels); //diff return value is the difference between the last two mouse events
    //check diff value. If greater than threshold, infinitely spin the model
    if(diff > 3) {
      requestAnimationFrame(autorotate);
    }
  }
}

function autorotate() {
  trackball.spin(1.5);
  render();
  if(!isLeftMouseDown)
  {
    requestAnimationFrame(autorotate);
  }
}


initialize();