import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("public/image.png");

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { map: texture } );
const cube = new THREE.Mesh( geometry, material );
cube.position.x = -2;
scene.add( cube );

camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const loader = new GLTFLoader();
let model;

loader.load(
  'public/dog.glb',
  function (gltf) {
    model = gltf.scene;
    model.position.x = 1;
    model.position.y = -1;
    model.scale.set(1, 1, 1);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const rainCount = 5000;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = [];

for (let i = 0; i < rainCount; i++) {
  const x = (Math.random() - 0.5) * 50;
  const y = Math.random() * 50;
  const z = (Math.random() - 0.5) * 50;
  rainPositions.push(x, y, z);
}

rainGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(rainPositions, 3)
);

const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const positions = rainGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.2;
        if (positions[i + 1] < -5) {
        positions[i + 1] = 50;
        }
    }
    rainGeometry.attributes.position.needsUpdate = true;
    
    renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );


function handleOrientation(event) {
  const { alpha, beta, gamma } = event;

  const xRot = (beta || 0) * (Math.PI / 180);
  const yRot = (gamma || 0) * (Math.PI / 180);
  const zRot = (alpha || 0) * (Math.PI / 180);

  if (model) {
    model.rotation.set(xRot, yRot, zRot);
  }
  cube.rotation.set(xRot, yRot, zRot);
}

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', handleOrientation, true);
}

function handleMotion(event) {
  const acc = event.accelerationIncludingGravity;
  if (acc && model) {
    model.position.y = acc.y * 0.1;
  }
}

if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', handleMotion, true);
}

scene.fog = new THREE.Fog( 0xcccccc, 10, 15 );