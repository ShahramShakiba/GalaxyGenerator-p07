import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { debugGUI, parameters } from './gui';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

//====================== Texture ======================
const textureLoader = new THREE.TextureLoader();

textureLoader.load('./textures/2k_stars.jpg', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  // Improves performance by minification filtering
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.encoding = THREE.sRGBEncoding;

  // Set the scene's environment and background
  scene.environment = texture;
  scene.background = texture;
});

const galaxyTexture = textureLoader.load('./textures/galaxy.png');

//====================== Galaxy =======================
let galaxyGeometry = null;
let galaxyMaterial = null;
let galaxy = null;

const galaxyGenerator = () => {
  //=== Disposing old galaxy
  if (galaxy !== null) {
    galaxyGeometry.dispose();
    galaxyMaterial.dispose();
    scene.remove(galaxy);
  }

  //====================== Geometry
  galaxyGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3; // Each "i" will be 1-vertex[x, y, z]
    const radius = Math.random() * parameters.radius; // Explained ↓
    const spinAngle = radius * parameters.spin; // Explained ↓
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    // Explained ↓

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX; // X
    positions[i3 + 1] = randomY; // Y
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ; // Z

    // To avoid manipulating the base color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius); // Explained ↓

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  //=== Buffer Attribute
  galaxyGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  //====================== Material
  galaxyMaterial = new THREE.PointsMaterial({
    alphaMap: galaxyTexture,
    transparent: true,
    size: parameters.size,
    sizeAttenuation: true, // should be scaled by their distance from the camera
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true, // Add Color to each vertex
  });

  //====================== Points
  galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxy);
};

galaxyGenerator();

//==== Debug GUI
debugGUI(galaxyGenerator);

//====================== Camera =======================
let width = window.innerWidth;
let height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

//=================== Orbit Controls ==================
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//===================== Renderer ======================
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//==================== Resize Listener ================
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//==================== Resize Listener ================
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const sound = new THREE.Audio(audioListener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('./music/Hope to see you again.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);

  const playSound = () => {
    if (!sound.isPlaying) {
      sound.play();
    }
  };

  // Ensure the AudioContext is resumed on user interaction
  const handleAudioContext = () => {
    if (THREE.AudioContext.getContext().state === 'suspended') {
      THREE.AudioContext.getContext().resume().then(playSound);
    } else {
      playSound();
    }
  };

  document.addEventListener('click', handleAudioContext);
  document.addEventListener('touchstart', handleAudioContext);
});

//==================== Animate ========================
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (galaxy) {
    galaxy.rotation.y = elapsedTime * 0.04;
  }

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

/* 
* const radius = Math.random() * parameters.radius;

      radius   center    radius
  |--------------|---------------|

  - establishing "particles" on a straight-line
  - starting from the center and putting the particles randomly on that line
*/

/* 
* const branchAngle =
*     ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

- imagine this, I want to create 3 branches
- I need to distribute "particles" only on this 3 branches equally

- I'm going to use modular % 3
- I get 0, 1, 2 and it never reaches 3
- in this way it gets back to 0 

- this goes for other quantity the same as above

- then I like my values goes from "0" to "1", so I divide it by 3 
- I get a range between [0, 0.33, 0.66], then it gets back to [0, 0.33, 0.66]

- so it doesn't reaches to 1 because we don't want to have 2 branches in one place --- if it reaches 1, imagine it like this, the first branches is on 0, the second branches will be on its opposite position(180deg), then the third branches will reaches 0 or 360deg again --- so we will have 2 branches on 1 place

- to have a full circle, I multiply PI by 2

  - see how it works
    if (i < 20) {
      console.log(i, branchAngle);
    }

- in the end, I put my value into Math.cos() for "X" axis
- I put my value into Math.sin() for "Z" axis
- to have my branches on a full circle pattern
*/

/* 
* const spinAngle = radius * parameters.spin;

  - spin depending on distance
  - we get a bigger spin-angle as distance goes further
*/

/*
* const randomX = (Math.random() - 0.5) * parameters.randomness * radius
               get values from -0.5 to +0.5
- We need randomness. 
- But what we truly need is spread stars on the "outside" and more condensed star on the "inside".

? It's working but it's not very convincing !!!

- we can use Math.pow(x, y) to crush the value. 
- x = Math.random()
- y = as we set a higher value, we get less value at the end of the galaxy

- The more power you apply, the closest to 0 it will get --- get more values in the center and less values at the outer part of the galaxy

- The problem is that you can't use a negative value with Math.pow(). 

- What we will do is calculate the power then multiply it by "-1" randomly.

*    const randomX =
*       Math.pow(Math.random(), parameters.randomnessPow) *
*       (Math.random() < 0.5 ? 1 : -1) *
*       parameters.randomness *
*       radius;

  - we need to do this for Y and Z, as well
*/

/* 
* mixedColor.lerp(colorOutside, radius / parameters.radius);

- The first parameter of lerp(...) is the other color, 
- and the second parameter is a value between 0 and 1. 

- If it's 0, the color will keep its base value, 
- and if it's 1 the result color will be the one provided. 

- We can use the radius divided by the radius parameter:
*/