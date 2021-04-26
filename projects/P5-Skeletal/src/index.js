
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


const loader = new GLTFLoader();//
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
camera.position.z = 5;

// lighting

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

// skeleton model
let skel;

const animate = function () {
  requestAnimationFrame( animate );
  if(skel) {
    //console.log(skel);
  }
  renderer.render( scene, camera );
};

function loadModel() {
  const loader = new GLTFLoader();//
  return loader.load( 'human-skeleton-animated.glb', function ( gltf ) {
    scene.add( gltf.scene );
    skel = gltf;
    console.log(gltf);
    anim(gltf);
  }, undefined, function ( error ) { 
    console.error( error );
  } );
}

function anim(mesh) {
  // Create an AnimationMixer, and get the list of AnimationClip instances
  const mixer = new THREE.AnimationMixer( mesh );
  const clips = mesh.animations;

  // Update the mixer on each frame
  function update () {
    mixer.update( deltaSeconds );
  }

  // Play a specific animation
  const clip = THREE.AnimationClip.findByName( clips, 'rigAction' );
  const action = mixer.clipAction( clip );
  //action.play();
}
async function initialize() {
  loadModel(); 

  console.log(skel);
  console.log("asdf");
  animate();
}



initialize();
