import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import * as THREE from 'three';
import { vertexColor } from 'three/examples/jsm/nodes/Nodes.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gui = new GUI().title('Galaxy Generator');

//====================== Galaxy =======================
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
};

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
    const i3 = i * 3;
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
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] =  mixedColor.r;
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
    size: parameters.size,
    sizeAttenuation: true, // should be scaled by their distance from the camera
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  //====================== Points
  galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxy);
};

galaxyGenerator();

//==== Debug GUI
gui
  .add(parameters, 'count')
  .min(300)
  .max(1000000)
  .step(150)
  .name('Count')
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .name('Size')
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .name('Radius')
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, 'branches')
  .min(2)
  .max(15)
  .step(1)
  .name('Branches')
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, 'spin')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('Spin')
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, 'randomness')
  .min(0)
  .max(2)
  .step(0.001)
  .name('Randomness')
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.001)
  .name('Randomness Power')
  .onFinishChange(galaxyGenerator);
gui
  .addColor(parameters, 'insideColor')
  .name('Inside Color')
  .onFinishChange(galaxyGenerator);
gui
  .addColor(parameters, 'outsideColor')
  .name('Outside Color')
  .onFinishChange(galaxyGenerator);

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
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//==================== Animate ========================
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

/* const radius = Math.random() * parameters.radius;

      radius   center    radius
  |--------------|---------------|

  - establishing "particles" on a straight-line
  - starting from the center and putting the particles randomly on that line
*/

/* const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

- imagine this, I want to create 3 branches
- I need to distribute "particles" only on this 3 branches equally

- I'm going to use modular % 3
- I get 0, 1, 2 and it never reaches 3
- in this way it gets back to 0 

- this goes for other quantity the same as above

- then I like my values goes from "0" to "1", so I divide it by 3 
- I get a range between [0, 0.33, 0.66], then it gets back to [0, 0.33, 0.66]

- so it doesn't reaches to 1 because we don't want to have 2 branches in one place --- if it reaches 1, imagine it like this, the first branches is on 0, the second branches will be on its opposite position(180deg), then the third branches will reaches 0 or 360deg again --- so we will have 2 branches on 1 place


- in the end, to have a full circle, I multiply PI by 2

  - see how it works
    if (i < 20) {
      console.log(i, branchAngle);
    }
*/

/* const spinAngle = radius * parameters.spin;

  - spin depending on distance
  - we get a bigger spin-angle as distance goes further
*/
