import GUI from 'lil-gui';

export const parameters = {
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

export const debugGUI = (galaxyGenerator) => {
  const gui = new GUI().title('Galaxy Generator');

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
};
