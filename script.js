// each charge of the form [x, y, charge]
let charges = [];
let sliders = [];
const TAU = 2 * Math.PI;

// create sliders to control the charges
function askForPoints() {
  let points = window.prompt("How many points do you want to graph?");
  for (var i = 0; i < points; i++)
    slidersForCharge(i);
  for (let i = 0; i < points; i++) {
    let newCharge = [];
    for (var entry of sliders[i].childNodes)
      newCharge.push(JSON.parse(entry.value));
    charges.push(newCharge);
  }
  window.addEventListener('resize', resize);
  resize();
}

// creates the sliders to control charge i
function slidersForCharge(i) {
  sliders.push(document.createElement('div'));
  createSlider(10, 10, i);
  createSlider(10, 10, i);
  createSlider(-200, 200, i);
  document.getElementById('controls').appendChild(sliders[i]);
}

// creates a slider and initializes relevant properties
function createSlider(min, max, i) {
  newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = min;
  newSlider.max = max;
  newSlider.addEventListener("input", redrawLines);
  newSlider.top = (50 + 10*i) + "px";
  sliders[i].appendChild(newSlider);
}
// resize the canvas and redraw fieldlines when the size of the page changes
function resize() {
  document.getElementById('lines').width = window.innerWidth;
  document.getElementById('lines').height = window.innerHeight;
  for (let i = 0; i < sliders.length; i++)
    updateSlider(i);
  updateCanvas();
}

// resizes sliders to match the new size of the window
function updateSlider(i) {
  let actualSliders = sliders[i].childNodes;
  actualSliders.item(0).max = window.innerWidth - 10; // minus 10 to keep the charges close to fully on the screen
  actualSliders.item(1).max = window.innerHeight - 10;
}

// draw field lines when a slider is changed
function redrawLines(e) {
  index = findElement(e);  
  charges[index[0]][index[1]] = JSON.parse(e.target.value);
  updateCanvas();
}

// finds the element of the charges array collresponding to e
function findElement(e) {
  for (let i = 0; true; i++)
    for (var entry of sliders[i].childNodes.entries())
      if (entry[1] === e.target)
        return [i, entry[0]];
}

// creates field lines, and draws field lines and charges
function updateCanvas() {
  let paths = calculateFieldLines();
  document.getElementById('lines').getContext('2d').clearRect(0, 0,       document.getElementById('lines').width, document.getElementById('lines').height);
  for (let i = 0; i < paths.length; i++)  drawPath(paths, i);
  for (var i = 0; i < charges.length; i++)  drawCharge(charges[i]);
}

// creates paths array of the form [[[x11, y11, v11], [x12, y12, v12], ...], [[x21, y21, v21], [x22, y22, v21], ...], ...] based on the charges array
function calculateFieldLines() {
  let paths = [];
  for (let charge of charges) {
    let angle = TAU * Math.random();
    let radius = Math.sqrt(Math.abs(charge[2]) + 2);
    for (let j = 0; j <= Math.abs(charge[2]); j++) {
      angle +=  TAU / Math.floor(1 + Math.abs(charge[2]));
      let newPoint = [charge[0] + radius * Math.cos(angle), charge[1] + radius * Math.sin(angle), charge[2]];
      if (!alreadyGenerated(paths, charge, newPoint)) paths.push(calculatePath(newPoint));
    }
  }
  return paths;
}

// goes through already existing paths and tests if any of them ends within the charge, and if a path does, tests if it is close enough for a path at angle to be redundant
function alreadyGenerated(paths, charge, newPoint) {
  for (let path of paths)
    if ((path.at(-1)[0] - charge[0])**2 + (path.at(-1)[1] - charge[1])**2 < Math.abs(charge[2] - 1))
      if ((path.at(-1)[0] - newPoint[0])**2 + (path.at(-1)[1] - newPoint[1])**2 < 1 + Math.abs(charge[2])**(-1)) return true;
  return false;
}

// based on a point, generates a path of where that point would be pushed
function calculatePath(startPoint) {
  if (startPoint[1] > window.innerHeight || startPoint[1] < 0 || startPoint[0] > window.innerWidth || startPoint[0] < 0) return [startPoint];
  let fieldStrength = [0, 0];
  let voltage = 0;
  for (var i = 0; i < charges.length; i++) {
    let distanceSquare = (startPoint[0] - charges[i][0])**2 + (startPoint[1] - charges[i][1])**2;
    if (distanceSquare < Math.abs(charges[i][2]) + 1) return [startPoint];
    addStrength(startPoint, fieldStrength, charges[i], distanceSquare);
    voltage += charges[i][2] / Math.sqrt(distanceSquare);
  }
  fieldStrength = [fieldStrength[0] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2), fieldStrength[1] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2)];
  return [[startPoint[0], startPoint[1], voltage]].concat(calculatePath([startPoint[0] + fieldStrength[0], startPoint[1] + fieldStrength[1], startPoint[2]]));
}

// adds the electric force a charge applies to a point to the fieldStrength array
function addStrength(startPoint, fieldStrength, charge, distanceSquare) {
  let magnitude = Math.sign(startPoint[0] - charge[0]) * charge[2] * Math.sign(startPoint[2]) / distanceSquare;
  fieldStrength[0] += magnitude * Math.cos(Math.atan((startPoint[1] - charge[1]) / (startPoint[0] - charge[0])));
  fieldStrength[1] += magnitude * Math.sin(Math.atan((startPoint[1] - charge[1]) / (startPoint[0] - charge[0])));
}

// given an array of points [x, y, voltage], draws a line along the path with color based on the voltage at that point
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

// draws a charge passed to it as a circle on the canvas, with radius and color dependent on the charge strength
function drawCharge(charge) {
  let ctx = document.getElementById('lines').getContext('2d');
  ctx.beginPath();
  if (Math.sign(charge[2]) === 1) ctx.fillStyle = "#ff0000";
  else ctx.fillStyle = "#0000ff";
  ctx.arc(charge[0], charge[1], Math.sqrt(Math.abs(charge[2]) + 2), Math.sqrt(Math.abs(charge[2])), 0, TAU);
  ctx.fill();
}