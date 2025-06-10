const canvas = document.getElementById('visualizer');
const audioFile = document.getElementById('audioFile');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const presetSelect = document.getElementById('presetSelect');

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode, audioBuffer, viz;
let isPlaying = false;

// Create visualizer
viz = butterchurn.createVisualizer(audioCtx, canvas, {
  width: window.innerWidth,
  height: window.innerHeight - 60
});
viz.connectAudio(audioCtx.createGain());
viz.connectAudio(audioCtx.destination);
viz.render();

console.log("butterchurnPresets object:", butterchurnPresets);

// Hardcode one preset to test dropdown population
const allPresets = {
  "Rainbow": {
    "fRating": 3.5,
    "fGammaAdj": 1,
    "fDecay": 0.9,
    "fVideoEchoZoom": 1,
    "fVideoEchoAlpha": 0.5,
    "nVideoEchoOrientation": 0,
    "fShader": 0,
    "zoom": 1,
    "rot": 0,
    "cx": 0.5,
    "cy": 0.5,
    "dx": 0,
    "dy": 0,
    "warp": 0,
    "sx": 1,
    "sy": 1,
    "cx": 0.5,
    "cy": 0.5,
    "shader": 0
    // (Minimal example - you can add full preset data later)
  }
};

const presetNames = Object.keys(allPresets);
presetNames.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  option.text = name;
  presetSelect.appendChild(option);
});

presetSelect.value = presetNames[0];
viz.loadPreset(allPresets[presetNames[0]], 2.0);

presetSelect.addEventListener('change', () => {
  const name = presetSelect.value;
  viz.loadPreset(allPresets[name], 2.0);
});

window.addEventListener('resize', () => {
  viz.setRendererSize(window.innerWidth, window.innerHeight - 60);
});

audioFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  if (sourceNode) sourceNode.stop();
  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(audioCtx.destination);
  viz.connectAudio(sourceNode);

  sourceNode.onended = () => { isPlaying = false; };

  sourceNode.start();
  viz.loadPreset(allPresets[presetSelect.value], 2.0);
  isPlaying = true;
});

playBtn.addEventListener('click', () => {
  if (!audioBuffer || isPlaying) return;
  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(audioCtx.destination);
  viz.connectAudio(sourceNode);
  sourceNode.start();
  isPlaying = true;
});

pauseBtn.addEventListener('click', () => {
  if (sourceNode && isPlaying) {
    sourceNode.stop();
    isPlaying = false;
  }
});
