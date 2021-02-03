import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
console.log(window.gl);

let vertex_array;
let shader_program;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 0.5, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  shader_program.bind();
  vertex_array.bind();
  vertex_array.drawSequence(gl.POINTS);
  vertex_array.unbind();
  shader_program.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

function sample(a, b, n, ps) {
  vertex_array?.destroy();
  const positions = [];

  const nSamples = 6000
  for (let i = 0; i < nSamples; ++i) {
    const t = i / nSamples * 2 * Math.PI;
    const x = a * Math.sin(t);
    const y = b * Math.sin(n*t+ps)
    positions.push(x, y, 0);
  }
  
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', nSamples, 3, positions);
  vertex_array = new VertexArray(shader_program, attributes);
}

async function initialize() {
  const vertexSource = `
  in vec3 position;

  void main() {
    gl_Position = vec4(position, 1.0);
    gl_PointSize = 2.0; 
  }
  `;

  const fragmentSource = `
  out vec4 fragmentColor;

  void main() {
    fragmentColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
  `;

  shader_program = new ShaderProgram(vertexSource, fragmentSource);
  sample(2, 2, 2, 2);

  const inputNsamples = document.getElementById('input-nsamples');
const inputA = document.getElementById('input-a');
const inputB = document.getElementById('input-b');
const inputN = document.getElementById('input-n');
const inputPhaseShift = document.getElementById('input-phase-shift');

const resample = () => {
  const nsamples = parseInt(inputNsamples.value);
  const a = parseFloat(inputA.value);
  const b = parseFloat(inputB.value);
  const n = parseFloat(inputN.value);
  const phaseShift = parseFloat(inputPhaseShift.value);
  sample(nsamples, a, b, n, phaseShift);
  render();
};

inputNsamples.addEventListener('input', resample);
inputA.addEventListener('input', resample);
inputB.addEventListener('input', resample);
inputN.addEventListener('input', resample);
inputPhaseShift.addEventListener('input', resample);
  
  window.addEventListener('resize', onSizeChanged);
  onSizeChanged();
}

initialize();