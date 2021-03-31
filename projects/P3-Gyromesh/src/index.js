import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {Matrix4} from './Matrix4';
import {Vector2} from './Vector2';
import {Trackball} from './Trackball';
import { Vector3 } from './Vector3';
import {Camera} from './camera';


const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let clipFromEye;
let isLeftMouseDown = false;
let trackball;
let camera;
let modelDimensions = new Vector3(0,0,0);

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('worldFromModel', trackball.rotation);
  shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  shaderProgram.setUniformMatrix4('eyeFromWorld', camera.matrix);

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
    right = 10;
    top = right / aspectRatio;
  } else {
    top = 10;
    right = top * aspectRatio;
  }

  clipFromEye = Matrix4.ortho(-right, right, -top, top, -1000, 1000);
  clipFromEye = Matrix4.fovPerspective(45, aspectRatio, 0.01, 1000);

  trackball.setViewport(canvas.width, canvas.height);
  
  render();
}

function generateObj (inputFile) {
  let positionsBase = [];
  let normalsBase = [];
  let indices = [];

  let positions = [];
  let normals = [];

  var arr = inputFile.split("\n");
  for (var i = 0; i < arr.length; i++)
  {
    let cur = arr[i];
    if(i%50000 == 0) {
      console.log(i);
    }

    let splits = cur.split(" ");
    
    if (splits[0] == "v") {
      if(parseInt(splits[1]) > modelDimensions.x) {
        modelDimensions.x = parseInt(splits[1]);
      }
      if(parseInt(splits[2]) > modelDimensions.y) {
        modelDimensions.y = parseInt(splits[2]);
      }
      if(parseInt(splits[3]) > modelDimensions.z) {
        console.log(splits[3],modelDimensions.z)
        modelDimensions.z = parseInt(splits[3]);
      }
      positionsBase.push.apply(positionsBase, splits.splice(1,3));
    }
    
    if (splits[0] == "vn") {
      normalsBase.push.apply(normalsBase, splits.splice(1,3));
    }

    if (splits[0] == "f" ) {
      splits = splits.splice(1,3);
      for (let j in splits) {
        splits[j] = splits[j].split("//")
        for (var k = 3; k > 0; k--) {
          positions.push.apply(positions, [positionsBase[splits[j][0]*3-k]]);
          normals.push.apply(normals, [normalsBase[splits[j][1]*3-k]])
        }
        indices.push.apply(indices,[indices.length]);
      }
    }
  }

  return {positions, normals, indices};
}

async function initialize() {
  const vertexSource = `
  uniform mat4 worldFromModel;
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromWorld;
  in vec3 position;
  in vec3 normal;

  out vec3 fnormal;
  out vec3 positionEye;
  
  void main() {
    positionEye = (eyeFromWorld * worldFromModel * vec4(position, 1.0)).xyz;
    gl_Position = clipFromEye * vec4(positionEye, 1.0);

    fnormal = (eyeFromWorld * worldFromModel * vec4(normal, 0)).xyz;
  }
  `;

  const fragmentSource = `
  const float ambientWeight = 0.1;
  const vec3 lightPosition = vec3(10.0,20.0,0.0);
  const vec3 lightColor = vec3(.75);
  const float shininess = 10.0;

  in vec3 positionEye;
  in vec3 fnormal;

  out vec4 fragmentColor;
  
  void main() {
    vec3 lightVector =  normalize(lightPosition - positionEye);
    vec3 normal = normalize(fnormal);

    // Diffuse
    float litness = max(0.0, dot(normal, lightVector));
    vec3 diffuse = litness * lightColor * (1.0 - ambientWeight);

    // Ambient
    vec3 ambient = lightColor * ambientWeight;

    // Specular
    vec3 reflectedLightVector = 2.0 * dot(normal, lightVector) * normal - lightVector;
    vec3 eyeVector = -normalize(positionEye);

    vec3 halfVector = normalize(lightVector + eyeVector);
    float specularity = max(0.0, dot(halfVector, normal));

    vec3 specular = vec3(1.0) * pow(specularity, shininess);

    vec3 rgb = ambient + diffuse + specular;
    rgb = ambient/10.0 + diffuse/10.0 + specular;
    fragmentColor = vec4(rgb, 1.0);
  }
  `;
  
  trackball = new Trackball();
  camera = new Camera(new Vector3(0,3,35),new Vector3(0,0,3),new Vector3(0,1,0))

  // files to fetch
  let inputFile = await fetch("Hydra.obj").then(response => response.text());

  //let inputFile = await fetch("winged-victory-of-samothrace-at-the-louvre-paris-1.obj").then(response => response.text());
  //let inputFile = await fetch("notreDame.obj").then(response => response.text());
  //let inputFile = await fetch("hungarian-parliament-1.obj").then(response => response.text());
  const {positions, normals, indices} = generateObj(inputFile);  

  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  attributes.addIndices(indices);

  //scale model
  let largestDim = 0;
  if (modelDimensions.x > modelDimensions.y && modelDimensions.x > modelDimensions.z) {
    largestDim = modelDimensions.x;
  } else if (modelDimensions.y > modelDimensions.z) {
    largestDim = modelDimensions.y;
  } else {
    largestDim = modelDimensions.z;
  }
  trackball.previousRotation = trackball.rotation.multiplyMatrix4(Matrix4.scale(15/largestDim,15/largestDim,15/largestDim));
  trackball.rotation = trackball.rotation.multiplyMatrix4(Matrix4.scale(15/largestDim,15/largestDim,15/largestDim));

  trackball.previousRotation = trackball.rotation.multiplyMatrix4(Matrix4.translate(modelDimensions.x/-2, modelDimensions.y/-2, modelDimensions.z/-2));
  trackball.rotation = trackball.rotation.multiplyMatrix4(Matrix4.translate(modelDimensions.x/-2, modelDimensions.y/-2, modelDimensions.z/-2));

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

initialize();

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
    trackball.drag(mousePixels, 2);
    render();
  }
}

function onMouseUp(event) {
  if (isLeftMouseDown) {
    isLeftMouseDown = false;
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.end(mousePixels);
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
  } else if (event.key === 'e') {
    document.body.requestPointerLock();
  }
  render();
});

window.addEventListener('mousemove', event => {
  if (document.pointerLockElement) {
    camera.yaw(-event.movementX * 0.01);
    camera.pitch(-event.movementY * 0.01);
    render();
  }
});
