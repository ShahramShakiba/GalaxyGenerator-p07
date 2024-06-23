import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import * as THREE from 'three';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gui = new GUI().title('Galaxy Generator');

//====================== Galaxy =======================
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;

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

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    // Explained below ↓

    positions[i3] = Math.cos(branchAngle) * radius; // X
    positions[i3 + 1] = 0; // Y
    positions[i3 + 2] = Math.sin(branchAngle) * radius; // Z
  }

  galaxyGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  //====================== Material
  galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true, // should be scaled by their distance from the camera
    depthWrite: false,
    blending: THREE.AdditiveBlending,
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
