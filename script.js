// each charge of the form [x, y, charge]
let charges = [];
let sliders = [];
const TAU = 2 * Math.PI;

// create sliders to control the charges
function askForPoints() {
  let points = window.prompt("How many points do you want to graph?");
  for (var i = 0; i < points; i++) {
    slidersForCharge(i);
  }
  for (let i = 0; i < points; i++) {
    let newCharge = [];
    for (var entry of sliders[i].childNodes)
      newCharge.push(JSON.parse(entry.value));
    charges.push(newCharge);
  }
  window.addEventListener('resize', resize)
  resize();
}

function slidersForCharge(i) {
  sliders.push(document.createElement('div'));
  createSlider(10, 10, i);
  createSlider(10, 10, i);
  createSlider(-200, 200, i);
  document.getElementById('controls').appendChild(sliders[i]);
}

function createSlider(min, max, i) {
  newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = min;
  newSlider.max = max;
  newSlider.addEventListener("input", redrawLines);
  newSlider.top = (50 + 10*i) + "px";
  sliders[i].appendChild(newSlider);
}

function resize() {
  document.getElementById('lines').width = window.innerWidth;
  document.getElementById('lines').height = window.innerHeight;
  for (let i = 0; i < sliders.length; i++) {
    let actualSliders = sliders[i].childNodes
    actualSliders.item(0).max = window.innerWidth - 10;
    actualSliders.item(1).max = window.innerHeight - 10;
  } 
  updateCanvas();
}

// draw field lines when a slider is changed
function redrawLines(e) {
  index = findElement(e);  
  charges[index[0]][index[1]] = JSON.parse(e.target.value);
  updateCanvas();
}

function findElement(e) {
  for (let i = 0; true; i++)
    for (var entry of sliders[i].childNodes.entries())
      if (entry[1] === e.target)
        return [i, entry[0]];
}

function updateCanvas() {
  let paths = calculateFieldLines();
  let c = document.getElementById('lines');
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
  for (let i = 0; i < paths.length; i++)  drawPath(paths, i);
  for (var i = 0; i < charges.length; i++)  drawCharge(charges[i]);
}

// creates paths array of the form [[[x11, y11, v11], [x12, y12, v12], ...], [[x21, y21, v21], [x22, y22, v21], ...], ...]
function calculateFieldLines() {
  let paths = [];
  for (let i = 0; i < charges.length; i++) {
    let angle = TAU * Math.random();
    let radius = Math.sqrt(Math.abs(charges[i][2]));
    for (let j = 0; j < Math.abs(charges[i][2]); j++) {
      angle +=  TAU / Math.floor(Math.abs(charges[i][2]));
      let newPoint = [charges[i][0] + radius * Math.cos(angle), charges[i][1] + radius * Math.sin(angle), charges[i][2]];
      if (!alreadyGenerated(paths, charges[i], newPoint)) paths.push(calculatePath(newPoint));
    }
  }
  return paths;
}

function alreadyGenerated(paths, charge, newPoint) {
  // goes through already existing paths and tests if any of them ends within the charge, and if a path does, tests if it is close enough for a path at angle to be redundant
  for (let path of paths)
    if ((path.at(-1)[0] - charge[0])**2 + (path.at(-1)[1] - charge[1])**2 < Math.abs(charge[2] - 1))
      if ((path.at(-1)[0] - newPoint[0])**2 + (path.at(-1)[1] - newPoint[1])**2 < 1 + Math.abs(charge[2])**(-1)) return true;
  return false;
}

function calculatePath(startPoint) {
  if (startPoint[1] > window.innerHeight || startPoint[1] < 0 || startPoint[0] > window.innerWidth || startPoint[0] < 0)
    return [startPoint];
  let fieldStrength = [0, 0];
  let voltage = 0;
  for (var i = 0; i < charges.length; i++) {
    let distanceSquare = (startPoint[0] - charges[i][0])**2 + (startPoint[1] - charges[i][1])**2;
    if (distanceSquare < Math.abs(charges[i][2]) - 1) return [startPoint];
    addStrength(startPoint, fieldStrength, charges[i], distanceSquare);
    voltage += charges[i][2] / Math.sqrt(distanceSquare);
  }
  fieldStrength = [fieldStrength[0] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2), fieldStrength[1] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2)];
  return [[startPoint[0], startPoint[1], voltage]].concat(calculatePath([startPoint[0] + fieldStrength[0], startPoint[1] + fieldStrength[1], startPoint[2]]));
}

function addStrength(startPoint, fieldStrength, charge, distanceSquare) {
  let magnitude = Math.sign(startPoint[0] - charge[0]) * charge[2] * Math.sign(startPoint[2]) / distanceSquare;
  fieldStrength[0] += magnitude * Math.cos(Math.atan((startPoint[1] - charge[1]) / (startPoint[0] - charge[0])));
  fieldStrength[1] += magnitude * Math.sin(Math.atan((startPoint[1] - charge[1]) / (startPoint[0] - charge[0])));
}

function drawPath(paths, i) {
  let ctx = document.getElementById('lines').getContext('2d');
  for (var j = 0; j < paths[i].length - 1; j++) {
    ctx.beginPath();
    // .13 has no particular significance, just makes the color change at a nice looking rate
    let sigmoid = 1 / (1 + 0.13 ** paths[i][j][2]);
    ctx.strokeStyle = 'rgb(' + (250 * sigmoid) + ',0,' + (250 - 250 * sigmoid) + ')';
    ctx.moveTo(paths[i][j][0], paths[i][j][1]);
    ctx.lineTo(paths[i][j + 1][0], paths[i][j + 1][1]);
    ctx.stroke();
  }
}

function drawCharge(charge) {
  let ctx = document.getElementById('lines').getContext('2d');
  ctx.beginPath();
  if (Math.sign(charge[2]) === 1) ctx.fillStyle = "#ff0000";
  else ctx.fillStyle = "#0000ff";
  ctx.arc(charge[0], charge[1], Math.sqrt(Math.abs(charge[2])), Math.sqrt(Math.abs(charge[2])), 0, TAU);
  ctx.fill();
}