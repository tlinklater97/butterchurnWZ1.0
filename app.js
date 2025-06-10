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
viz.connectAudio(audioCtx.createGain()); // connect dummy gain for now
viz.connectAudio(audioCtx.destination);
viz.render();

// Attempt to load presets with fallback
let allPresets = {};
if (butterchurnPresets.getPresets) {
  allPresets = butterchurnPresets.getPresets();
}
if (!allPresets || Object.keys(allPresets).length === 0) {
  console.warn('butterchurnPresets.getPresets() returned empty, using fallback presets');
  allPresets = {
    "Rainbow": butterchurnPresets.presets["Rainbow"],
    "Spiral": butterchurnPresets.presets["Spiral"]
  };
}

console.log("Loaded presets:", allPresets);

const presetNames = Object.keys(allPresets);
presetNames.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  option.text = name;
  presetSelect.appendChild(option);
});

// Load first preset by default
if (presetNames.length > 0) {
  presetSelect.value = presetNames[0];
  viz.loadPreset(allPresets[presetNames[0]], 2.0);
}

presetSelect.addEventListener('change', () => {
  const name = presetSelect.value;
  viz.loadPreset(allPresets[name], 2.0);
});

window.addEventListener('resize', () => {
  viz.setRendererSize(window.innerWidth, window.innerHeight - 60);
});

// Handle file upload
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

// Play / Pause controls
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
