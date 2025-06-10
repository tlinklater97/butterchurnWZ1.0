import butterchurn from 'https://cdn.jsdelivr.net/npm/butterchurn@3.0.5/lib/butterchurn.min.js';
import butterchurnPresets from 'https://cdn.jsdelivr.net/npm/butterchurn-presets@3.0.5/lib/butterchurnPresets.min.js';

const canvas = document.getElementById('visualizer');
const audioFile = document.getElementById('audioFile');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const presetSelect = document.getElementById('presetSelect');

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode = null;
let audioBuffer = null;
let viz = null;
let isPlaying = false;

// Create visualizer instance
viz = butterchurn.createVisualizer(audioCtx, canvas, {
  width: window.innerWidth,
  height: window.innerHeight - 50,
  pixelRatio: window.devicePixelRatio || 1,
});
viz.connectAudio(audioCtx.createGain());
viz.connectAudio(audioCtx.destination);
viz.render();

// Load presets
const allPresets = butterchurnPresets.getPresets();
const presetNames = Object.keys(allPresets);
presetNames.forEach(name => {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
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
  viz.setRendererSize(window.innerWidth, window.innerHeight - 50);
});

audioFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const arrayBuffer = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  if (sourceNode) {
    try {
      sourceNode.stop();
    } catch {}
    sourceNode.disconnect();
  }

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(audioCtx.destination);
  viz.connectAudio(sourceNode);

  sourceNode.onended = () => { isPlaying = false; };

  sourceNode.start();
  isPlaying = true;
});

playBtn.addEventListener('click', () => {
  if (!audioBuffer || isPlaying) return;

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(audioCtx.destination);
  viz.connectAudio(sourceNode);

  sourceNode.onended = () => { isPlaying = false; };

  sourceNode.start();
  isPlaying = true;
});

pauseBtn.addEventListener('click', () => {
  if (sourceNode && isPlaying) {
    try {
      sourceNode.stop();
    } catch {}
    isPlaying = false;
  }
});
