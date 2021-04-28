
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let camera, scene, renderer;
let mixer, animations;

let prevTime = Date.now();

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set( 100, 200, 300 );
  camera.lookAt(0,0,0)

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );

  //
  scene.background = new THREE.Color( 0xa0a0a0 );
  scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 200, 0 );
  scene.add( hemiLight );

  const dirLight = new THREE.DirectionalLight( 0xffffff );
  dirLight.position.set( 0, 200, 100 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 180;
  dirLight.shadow.camera.bottom = - 100;
  dirLight.shadow.camera.left = - 120;
  dirLight.shadow.camera.right = 120;
  scene.add( dirLight );

  //

  // ground
  const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add( mesh );

  const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add( grid );

  // model
  const loader = new FBXLoader();
  loader.load( 'human-skeleton-animated.fbx', function ( object ) {

    
    mixer = new THREE.AnimationMixer( object );
    animations = object.animations;
    console.log(animations);
    console.log(object);
    
    object.traverse( function ( child ) {

      if ( child.isMesh ) {

        child.castShadow = true;
        child.receiveShadow = true;

      }

    } );

    scene.add( object );

    mixer.clipAction( animations[ 0 ] ).setDuration( 1 ).play().fadeIn(1).fadeOut();
    mixer.clipAction( animations[ 1 ] ).setDuration( 1 ).play().fadeIn(1).fadeOut();
    mixer.clipAction( animations[ 2 ] ).setDuration( 1 ).play().fadeIn(1).fadeOut();

  } );

  //
  renderer = new THREE.WebGLRenderer( { antialias: true } );

  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  document.body.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize );
  window.addEventListener('keydown', event => {
    if (event.key === '1') {
      activateAnimation(0,1);
    } 
    if (event.key === '2') {
      activateAnimation(1,3);
    }
    if (event.key === '3') {
      activateAnimation(2,3);
    } 
    if (event.key === '4') {
      activateAnimationToggle(0,1);
    } 
    if (event.key === '5') {
      activateAnimationToggle(1,3);
    }
    if (event.key === '6') {
      activateAnimationToggle(2,3);
    }
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function activateAnimation(animationNum, animationTime) {

  animations.forEach(element => {
    if(mixer.clipAction( element ).isRunning()) {
      mixer.clipAction( element ).crossFadeTo(mixer.clipAction( animations[ animationNum ] ).setDuration(animationTime),);
    }
  });
}

async function activateAnimationToggle(animationNum, animationTime) {
  animations.forEach(element => {
    console.log(mixer.clipAction( element ).getEffectiveWeight(),mixer.clipAction( element ).isRunning());
  });
  console.log("\n");
  if(mixer.clipAction( animations[ animationNum ] ).getEffectiveWeight() === 0) {
    await mixer.clipAction( animations[ animationNum ] ).setDuration( animationTime ).fadeIn(1).play();
  }
  else {
    await mixer.clipAction( animations[ animationNum ] ).setDuration( animationTime ).fadeOut().play();
  }
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {

  if ( mixer ) {
    const time = Date.now();
    mixer.update( ( time - prevTime ) * 0.001 );
    prevTime = time;
  }
  renderer.render( scene, camera );
}