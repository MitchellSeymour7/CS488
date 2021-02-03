import {VertexArray} from './VertexArray';
import {VertexAttributes} from './VertexAttributes';
import {ShaderProgram} from './ShaderProgram';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');
console.log(window.gl);

let vertexArray;
let shaderProgram;
let time = 0;
let fragmentSource;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  shaderProgram.bind();
  shaderProgram.setUniform1f('dimX',canvas.width);
  shaderProgram.setUniform1f('dimY',canvas.height);
  shaderProgram.setUniform1f('time',time);
  vertexArray.bind();
  vertexArray.drawSequence(gl.TRIANGLE_FAN);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

function square() {
  vertexArray?.destroy();

  const positions = [
    -1, -1, 0,
     1, -1, 0,
     1,  1, 0,
    -1,  1, 0,
  ];
  
  const colors = [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
  ];
  
  const attributes = new VertexAttributes();
  attributes.addAttribute('position', 4, 3, positions);
  attributes.addAttribute('color', 4, 3, colors);
  vertexArray = new VertexArray(shaderProgram, attributes);
}

async function initialize() {
  const vertexSource = `
  in vec3 position;
  in vec3 color;

  out vec3 fcolor;

  void main() {
    gl_Position = vec4(position, 1.0);
    gl_PointSize = 2.0; 
    fcolor = color;
  }
  `;

  let fragmentSourceStart = `
  uniform float dimX;
  uniform float dimY;
  uniform float time;
  vec2 dimensions;

  in vec3 fcolor;

  out vec4 fragmentColor;
  ` ;

  // default coloring
  let fIn = `
  vec3 f() {
  vec3 rColor = vec3(1,1,1);
  return rColor;
  }`;

  let fragmentSourceEnd = `
  void main() {
    dimensions = vec2(dimX,dimY);
    fragmentColor = vec4(f(),1);
  }
  `;
  fragmentSource = fragmentSourceStart+fIn+fragmentSourceEnd;
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  square();
  const inputF = document.getElementById('input-f');
  
  //set coloring to the user input
  const resample = () => {
    fragmentSource = fragmentSourceStart + inputF.value + fragmentSourceEnd;
    shaderProgram.destroy();
    shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
    render();
  };

  inputF.addEventListener('input', resample);
  window.addEventListener('resize', onSizeChanged);

  //sets time
  setInterval(() => {
    time += 1;
    render();
  }, 25);

  onSizeChanged();
}

initialize();

/*
vec3 f() {
  vec3 rColor;
  float val = mod(gl_FragCoord.x-gl_FragCoord.y,30.0)/30.0;
  rColor = vec3(val);
  if(mod(gl_FragCoord.x+gl_FragCoord.y,60.0) < 30.0) {
    rColor = vec3(0);
  }
  if(mod(gl_FragCoord.x-gl_FragCoord.y,60.0) < 30.0) {
    rColor = vec3(1)-val;
  }
  if(!(mod(gl_FragCoord.x-gl_FragCoord.y,60.0) < 30.0)&&!(mod(gl_FragCoord.x+gl_FragCoord.y,60.0) < 30.0)) {
    rColor = vec3(mod(gl_FragCoord.x+gl_FragCoord.y,30.0)/30.0);
  }
  if((mod(gl_FragCoord.x-gl_FragCoord.y,120.0) < 30.0)&&(mod(gl_FragCoord.x+gl_FragCoord.y,120.0) > 90.0)) {
    rColor = vec3(mod(gl_FragCoord.x+gl_FragCoord.y,30.0)/30.0);
  }
  if((mod(gl_FragCoord.x-gl_FragCoord.y+60.0,120.0) < 30.0)&&(mod(gl_FragCoord.x+gl_FragCoord.y+60.0,120.0) > 90.0)) {
    rColor = vec3(mod(gl_FragCoord.x+gl_FragCoord.y,30.0)/30.0);
  }
  return rColor;
}
//---------------
vec3 f() {
  vec3 rColor = vec3(1,1,1);
  rColor.x = (mod(gl_FragCoord.x+gl_FragCoord.y+time, 30.0))/27.0+0.1;
  rColor.y = (mod(gl_FragCoord.x+gl_FragCoord.y+20.0+time, 30.0))/27.0+0.1;
  rColor.z = (mod(gl_FragCoord.x+gl_FragCoord.y+40.0+time, 30.0))/27.0+0.1;
  if(mod(gl_FragCoord.x+gl_FragCoord.y+time,60.0) < 30.0) {
    rColor.x = (1.0-mod((gl_FragCoord.x+gl_FragCoord.y+time), 30.0)/35.0)+0.1;
  }
  if(mod(gl_FragCoord.x+gl_FragCoord.y+20.0+time,60.0) < 30.0) {
    rColor.y = (1.0-mod((gl_FragCoord.x+gl_FragCoord.y+20.0+time), 30.0)/35.0)+0.1;
  }
  if(mod(gl_FragCoord.x+gl_FragCoord.y+40.0+time,60.0) < 30.0) {
    rColor.z = (1.0-mod((gl_FragCoord.x+gl_FragCoord.y+40.0+time), 30.0)/35.0)+0.1;
  }
  if(mod(gl_FragCoord.x,60.0) < 30.0) {
    rColor = (rColor + vec3(((mod(gl_FragCoord.x, 30.0))/30.0)))/1.7;
  }
  else {
    rColor = (rColor + vec3(((mod(-1.0*gl_FragCoord.x, 30.0))/30.0)))/1.7;
  }
  
  return rColor;
}
//---------------
vec3 f() {
  vec3 rColor = vec3(1,1,1);
  rColor.x = (mod(gl_FragCoord.x+gl_FragCoord.y, 30.0))/27.0+0.1;
  rColor.y = (mod(gl_FragCoord.x+gl_FragCoord.y+20.0, 30.0))/27.0+0.1;
  rColor.z = (mod(gl_FragCoord.x+gl_FragCoord.y+40.0, 30.0))/27.0+0.1;
  if(mod(gl_FragCoord.x+gl_FragCoord.y,60.0) < 30.0) {
    rColor.x = (1.0-mod((gl_FragCoord.x+gl_FragCoord.y), 30.0)/35.0)+0.1;
  }
  if(mod(gl_FragCoord.x+gl_FragCoord.y+20.0,60.0) < 30.0) {
    rColor.y = (1.0-mod((gl_FragCoord.x+gl_FragCoord.y+20.0), 30.0)/35.0)+0.1;
  }
  if(mod(gl_FragCoord.x+gl_FragCoord.y+40.0,60.0) < 30.0) {
    rColor.z = (1.0-mod((gl_FragCoord.x+gl_FragCoord.y+40.0), 30.0)/35.0)+0.1;
  }
  return rColor;
}
//---------------
vec3 f() {
  vec3 rColor = vec3(mod(gl_FragCoord.x, 30.0)/30.0+0.3,1,1);
  if(mod(gl_FragCoord.x, 60.0)<30.0) {
    rColor.x = (1.3-rColor.x);
  }
  return rColor;
}
//---------------
vec3 f() {
  vec3 rColor;
  rColor = vec3(mod(gl_FragCoord.x, 80.0)/80.0,mod(gl_FragCoord.y, 80.0)/80.0,1);
  return rColor;
}
//---------------
vec3 f() {
  vec3 rColor;
  bool isEvenX = (mod(gl_FragCoord.x, 8.0) < 4.0);
  bool isEvenY = (mod(gl_FragCoord.y, 8.0) < 4.0);
  if ((isEvenX||isEvenY)&&!(isEvenX&&isEvenY)) {
    rColor = fcolor;
  } else {
    rColor = vec3(1)-fcolor;
  }
  return rColor;
}
//---------------
vec3 f() {
  vec3 rColor;
  bool isEvenX = (mod(gl_FragCoord.x, 64.0) < 18.0);
  bool isEvenY = (mod(gl_FragCoord.y, 64.0) < 18.0);
  if (isEvenX&&isEvenY) {
    rColor = vec3(1,1,.5);
  }
  else if (isEvenX||isEvenY) {
    rColor = vec3(.35,0,0);
  } else {
    rColor = vec3(.7,.0,.2);
  }
  return rColor;
}
*/