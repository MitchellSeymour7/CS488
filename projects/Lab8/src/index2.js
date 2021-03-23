import {VertexArray} from './twodeejs/vertex_array';
import {VertexAttributes} from './twodeejs/vertex_attributes';
import {ShaderProgram} from './twodeejs/shader_program';
import {Matrix4} from './Matrix4.js';
import {Vector4} from './Vector4.js';
import { Vector3 } from './Vector3.js';
import { Vector2 } from './Vector2.js';
import { Trackball } from './trackball.js';
import { Camera } from './Camera.js';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
const fpsElem = document.querySelector("#fps");

let shaderProgram;
let clipFromEye;
let camera;
let fov = 60;
let walkingSpeed = 5;
let frametime = 0;
let keys = {'w': false, 'a': false, 's': false, 'd': false, ' ': false, 'q':false, 'e':false, 'f':false}

let vertexObjects = [];


function draw(timestamp)
{
    // Calculate FPS
    timestamp *= 0.001
    const elapsed = timestamp - frametime;
    frametime = timestamp;
    const fps = 1 / elapsed
    fpsElem.textContent = fps.toFixed(3);


    // Read Keys
    if (keys['a']) {
        camera.strafe(-walkingSpeed * elapsed);  
    } 
    if (keys['d']) {
        camera.strafe(walkingSpeed * elapsed);
    } 
    if (keys['w']) {
        camera.advance(walkingSpeed * elapsed);
    } 
    if (keys['s']) {
        camera.advance(-walkingSpeed * elapsed);
    }

    // Set Drawing Parameters
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(135/255, 206/255, 250/255, 1);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    shaderProgram.bind();
    shaderProgram.setUniformMatrix4('worldFromModel', Matrix4.rotateX(0));
    shaderProgram.setUniformMatrix4('eyeFromWorld', camera.matrix);
    shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);

    // Draw Objects
    for (let object of vertexObjects) {
        shaderProgram.setUniformMatrix4('objPosition', object.matrix ? object.matrix : Matrix4.identity());
        object.vertex.bind();
        object.vertex.drawIndexed(gl.TRIANGLES);
        object.vertex.unbind();
        
    }
    shaderProgram.unbind();
    
    
    window.requestAnimationFrame(draw);
}

function onSizeChanged() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio >= 1) {
        const t = 1.1;
        const r = t * aspectRatio;
        clipFromEye = Matrix4.ortho(-r, r, -t, t, -10, 10);
    } else {
        const r = 1.1;
        const t = r / aspectRatio;
        clipFromEye = Matrix4.ortho(-r, r, -t, t, -10, 10);
    }

    clipFromEye = Matrix4.fovPerspective(fov, aspectRatio, 0.01, 1000);

    //window.requestAnimationFrame(draw);
}

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

    attributes.addAttribute('color', colors.length / 3, 3, colors);
    attributes.addAttribute('position', objectToAdd.positions.length / 3, 3, objectToAdd.positions);
    attributes.addAttribute('normal', objectToAdd.positions.length / 3, 3, objectToAdd.normals);
    
    attributes.addIndices(objectToAdd.indices);

    let vertexArray = new VertexArray(shaderProgram, attributes);
    vertexObjects.push({vertex: vertexArray, matrix: Matrix4.identity()});

    
}

function modObject(objectIndex, matrix, resetPosiiton=false) {
    if (vertexObjects[objectIndex] == undefined) return;
    if (resetPosiiton) vertexObjects[objectIndex].matrix = Matrix4.identity()
    vertexObjects[objectIndex].matrix = (vertexObjects[objectIndex].matrix ? vertexObjects[objectIndex].matrix : Matrix4.identity()).multiplyMatrix4(matrix);
}

async function initialize() {

    camera = new Camera(new Vector3(0,1,5), new Vector3(0,0,0), new Vector3(0,1,0));
    

    const vertexSource = `
uniform mat4 clipFromEye;
uniform mat4 worldFromModel;
uniform mat4 eyeFromWorld;
uniform mat4 objPosition;

in vec3 position;
in vec3 color;
in vec3 normal;

out vec3 fnormal;
out vec3 fcolor;

void main() {
    gl_Position = clipFromEye * eyeFromWorld * worldFromModel * objPosition * vec4(position, 1.0);
    gl_PointSize = 10.0;
    fnormal = (worldFromModel * vec4(normal, 0)).xyz;
    fcolor = color;
}
    `;


    const fragmentSource = `
const vec3 light_direction = normalize(vec3(1.0, 1.0, 1.0));
const vec3 albedo = vec3(1.0, 1.0, 1.0);
in vec3 fnormal;
in vec3 fcolor;

out vec4 fragmentColor;

void main() {
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, light_direction));
    fragmentColor = vec4(fcolor, 1.0);
    //fragmentColor = vec4(vec3(litness), 1.0);
    //fragmentColor = vec4(vec3(1.0, 0.0, 0.5), 1.0);
}
    `;

    shaderProgram = new ShaderProgram(vertexSource, fragmentSource);

    
    addObject(generatePlane(100, 100, 200, 200),Matrix4.identity(), new Vector3(116/255,102/255,59/255)); //Create Brown Plane

    addObject(generateRectangle(1,1),Matrix4.rotateY(180).multiplyMatrix4(Matrix4.translate(1,1,1)))

    addObject(generateSphere(20,20),Matrix4.translate(1,1,1), new Vector3(0.1,0.2,0.3))

    window.addEventListener('resize', onSizeChanged);
    window.addEventListener('keydown', event => {
        switch(event.key) {
            case 'a':
            case 'w':
            case 's':
            case 'd':
            case 'f':
            case ' ':
                keys[event.key] = true;
                break;
            default:
                break;
        }
        if (event.key == 'q') {
                fov -= 1;
                onSizeChanged();
        }
        if (event.key == 'e') {
            fov += 1;
            onSizeChanged();
        }

    });

    window.addEventListener('keyup', event => {
        switch(event.key) {
            case 'a':
            case 'w':
            case 's':
            case 'd':
            case 'f':
            case ' ':
                keys[event.key] = false;
                break;
            default:
                break;
        }
    });

    window.addEventListener('mousedown', () => {
    document.body.requestPointerLock();
    });
    
    window.addEventListener('mousemove', event => {
    if (document.pointerLockElement) {
        camera.yaw(-event.movementX * 0.1);
        camera.pitch(-event.movementY * 0.1);
    }
    });

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

function generateCylinder(radius, height, nlatitudes, nlongitudes) {
    // generate wall positions
    // generate wall faces
    const positions = []
    const indices = []
    const normals = []
    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude+=1) {
        let radians = ilongitude / nlongitudes * 2 * Math.PI;
        let x = radius * Math.cos(radians);
        let z = radius * Math.sin(radians);
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) {
            let y = ilatitude / (nlatitudes - 1) * height - 0.5 * height;
            positions.push(x, y, z);
            normals.push(Math.cos(radians), 0, Math.sin(radians));
        }
    }  

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1) {
        const iNextLongitude = (ilongitude + 1) % nlongitudes;
    
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) {
            const iNextLatitude = (ilatitude + 1) % nlatitudes;
            // Bottom-left triangle
            indices.push(
                ilongitude * nlatitudes + ilatitude,
                ilongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + ilatitude,
            );
        
            // Top-right triangle
            indices.push(
                ilongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + ilatitude,
            );
        }
    }



    // Generate top cap.
    let icenter = positions.length / 3;
    positions.push(0, height * 0.5, 0);
    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1) {
        let radians = ilongitude / nlongitudes * 2 * Math.PI;
        let x = radius * Math.cos(radians);
        let z = radius * Math.sin(radians);
        positions.push(x, height * 0.5, z);
        indices.push(icenter, icenter + ilongitude, icenter + (ilongitude + 1) % nlongitudes);
    }

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1) {
        let radians = ilongitude / nlongitudes * 2 * Math.PI;
        let x = radius * Math.cos(radians);
        let z = radius * Math.sin(radians);
        positions.push(x, -height * 0.5, z);
        indices.push(icenter, icenter + ilongitude, icenter + (ilongitude + 1) % nlongitudes);
    }
    
    return {positions, normals, indices}
}

function generateCube(size) {
    size /= 2;
    let indices = [
        3,6,2,
        3,7,6,
        2,1,3,
        2,0,1,
        7,4,6,
        7,5,4,
        5,1,0,
        5,0,4,
        1,7,3,
        1,5,7,
        2,6,0,
        0,6,4,
    ]

    let positions = [
        -size, -size, -size, // 111 0
        -size, -size, size,  // 110 1
        -size, size, -size,  // 101 2
        -size, size, size,   // 100 3
        size, -size, -size,  // 011 4
        size, -size, size,   // 010 5
        size, size, -size,   // 001 6
        size, size,  size,   // 000 7
    ]
    let normals = [];

    return {indices, normals, positions};
}

function generatePyramid(base, height) {
    const positions = [
        -base, -base,  base,
        -base, -base, -base,
         base, -base,  base,
         base, -base, -base,
         0,  height,  0
    ];

    const normals = [ //colors
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
        1, 1, 0,
        0, 1, 1,
    ]

    const indices = [
        1, 2, 0, //bottom
        2, 1, 3, //bottom
        0, 2, 4, //1 b/r
        3, 1, 4, //1 y/g
        2, 3, 4, //2 y/b
        1, 0, 4, //2 g/r
    ]
    return {positions, normals, indices}
}

function generatePlane(width, height, nlatitudes, nlongitudes) {
    const positions = [];
    const normals = [];
    positions.push(null)
    positions.push(null)
    normals.push(null)
    normals.push(null)

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude+=1) {
        let x = ilongitude / (nlongitudes - 1) * width - width * 0.5
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude+=1) {
            let y = ilatitude / (nlatitudes - 1) * height - height * 0.5
            positions.push(x, y, 0)
        }
    }

    let indices = []
    for (let ilongitude = 0; ilongitude < nlongitudes - 1; ilongitude+=1){
        let iNextLongitude = ilongitude + 1

        for( let ilatitude = 0; ilatitude < nlatitudes - 1; ilatitude+=1) {
            let iNextLatitude = ilatitude + 1
            
            // Bottom-left triangle
        
            if (ilatitude % 2 == 1) {
                indices.push(
                    ilongitude * nlatitudes + ilatitude,
                    iNextLongitude * nlatitudes + ilatitude,
                    ilongitude * nlatitudes + iNextLatitude,
                )
            }
            
            if (ilongitude % 2 == 1) {
            // Top-right triangle
                indices.push(
                    iNextLongitude * nlatitudes + ilatitude,
                    iNextLongitude * nlatitudes + iNextLatitude,
                    ilongitude * nlatitudes + iNextLatitude,
                )
            }
            normals.push(0,0,0);
            
        }
    }
    

    return {positions, indices, normals};
}

function generateTorus(nlatitudes, nlongitudes, in_radius, out_radius) 
{  
    const scale = (out_radius - in_radius) / 2;
    const offset = (out_radius - in_radius) / 2 + in_radius;
    
    var seeds = [];
    var seedsNormals = [];
    for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) { //0 - 360
        const radians = ilatitude / nlatitudes * 2 * Math.PI;
        seeds.push(new Vector4(scale * Math.cos(radians) + offset, scale * Math.sin(radians), 0, 1));
        seedsNormals.push(new Vector4(Math.cos(radians), Math.sin(radians), 0, 0));
    }

    const positions = []
    const normals = []
    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1) {
        const degrees = ilongitude / nlongitudes * 360;
        const rotate = Matrix4.rotateY(degrees);
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) { //0 - 360
            let position = rotate.multiplyVector4(seeds[ilatitude]);
            let normal = rotate.multiplyVector4(seedsNormals[ilatitude]);
            positions.push(position.x, position.y, position.z);
            normals.push(normal.x, normal.y, normal.z);
        }
    }
    

    const indices = [];

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1) { //ilongitude to nlongitudes - 1
        const iNextLongitude = (ilongitude + 1) % nlongitudes;
    
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) {//ilatitude to nlatitudes - 1
            const iNextLatitude = (ilatitude + 1) % nlatitudes;
            // Bottom-left triangle
            indices.push(
                ilongitude * nlatitudes + iNextLatitude, //2
                ilongitude * nlatitudes + ilatitude, //1


                iNextLongitude * nlatitudes + ilatitude, //3
                
            );
        
            // Top-right triangle
            indices.push(
                iNextLongitude * nlatitudes + iNextLatitude, //2
                ilongitude * nlatitudes + iNextLatitude, //1


                iNextLongitude * nlatitudes + ilatitude, //3

            );
        }
    }
    return {positions, normals, indices}
}

function generateSphere(nlatitudes, nlongitudes) {
    var seeds = []
    for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) { //ilatitude to nlatitudes
        const radians = ilatitude / (nlatitudes - 1) * Math.PI - Math.PI * 0.5;
        seeds.push(new Vector4(Math.cos(radians), Math.sin(radians), 0, 1));
    }

    const positions = []
    const normals = []
    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1 ) {//ilongitude to nlongitudes
        const degrees = ilongitude / nlongitudes * 360;
        const rotation = Matrix4.rotateY(degrees);
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) {//ilatitude to nlatitudes
            const position = rotation.multiplyVector4(seeds[ilatitude]); //rotation * seeds[ilatitude]; 
            positions.push(position.x, position.y, position.z);
            normals.push(position.x, position.y, position.z);
        }
    }

    const indices = [];

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude += 1) {
        const iNextLongitude = (ilongitude + 1) % nlongitudes;
    
        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude += 1) {
            const iNextLatitude = (ilatitude + 1) % nlatitudes;
            // Bottom-left triangle
            indices.push(
                ilongitude * nlatitudes + ilatitude,
                ilongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + ilatitude,
            );
        
            // Top-right triangle
            indices.push(
                ilongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + ilatitude,
            );
        }
    }
    return {positions, normals, indices}
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
    return {positions, normals, indices};
}

initialize();
window.requestAnimationFrame(draw);

