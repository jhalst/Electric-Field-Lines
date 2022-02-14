// each charge of the form [x, y, charge]
let charges = [];
let sliders = [];
const TAU = 6.28318531;

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
  //sliders.push([]);
  createSlider(10, 10, i);
  createSlider(10, 10, i);
  createSlider(-200, 200, i);
  document.getElementById('controls').appendChild(sliders[i]);
}
//.insertBefore(sliders[i], document.getElementById('lines'));
function createSlider(min, max, i) {
  newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = min;
  newSlider.max = max;
  newSlider.addEventListener("input", redrawLines);
  newSlider.top = (50 + 10*i) + "px";
  sliders[i].appendChild(newSlider);
  //sliders[2 * i + 1].push(newSlider);
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
  let c = document.getElementById('lines')
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
  for (let i = 0; i < paths.length; i++) {
    drawPath(paths, i);
  }
  for (var i = 0; i < charges.length; i++) {
    drawCharge(charges[i]);
  }
}

// creates paths array of the form [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...], ...]
function calculateFieldLines() {
  let paths = [];
  for (let i = 0; i < charges.length; i++) {
    let angle = TAU * Math.random();
    let radius = Math.sqrt(Math.abs(charges[i][2]));
    //let angleStep = TAU / Math.floor(1 + Math.abs(charges[i][2]));
    for (let j = 0; j <= Math.abs(charges[i][2]); j++) {
      angle +=  TAU / Math.floor(1 + Math.abs(charges[i][2]));
      if (!alreadyGenerated(paths, charges[i], radius, angle)) paths.push(calculatePath([charges[i][0] + radius * Math.cos(angle), charges[i][1] + radius * Math.sin(angle), charges[i][2]]));
    }
  }
  return paths;
}
// not finished
function alreadyGenerated(paths, charge, radius, angle) {
  for (let path of paths)
  // tests if there any path ends within the charge, and if a path does, if it is close enough for the path at angle to be redundant
    if ((path.at(-1)[0] - charge[0])**2 + (path.at(-1)[1] - charge[1])**2 < Math.abs(charge[2] - 1) && (path.at(-1)[0] - charge[0] - radius * Math.cos(angle))**2 + (path.at(-1)[1] - charge[1] - radius * Math.sin(angle))**2 < 1 + Math.abs(charge[2])**(-1)) return true;
  return false;
}

function calculatePath(startPoint) {
  if (startPoint[1] > window.innerHeight || startPoint[1] < 0 || startPoint[0] > window.innerWidth || startPoint[0] < 0)
    return [startPoint];
  let fieldStrength = [0, 0];
  for (var i = 0; i < charges.length; i++) {
    let distanceSquare = (startPoint[0] - charges[i][0])**2 + (startPoint[1] - charges[i][1])**2;
    if (distanceSquare < Math.abs(charges[i][2]) - 1) return [startPoint];
    addStrength(startPoint, fieldStrength, charges[i], distanceSquare);
  }
  fieldStrength = [fieldStrength[0] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2), fieldStrength[1] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2)];
  return [startPoint].concat(calculatePath([startPoint[0] + fieldStrength[0], startPoint[1] + fieldStrength[1], startPoint[2]]));
}

function addStrength(startPoint, fieldStrength, charge, distanceSquare) {
  let magnitude = Math.sign(startPoint[0] - charge[0]) * charge[2] * Math.sign(startPoint[2]) / distanceSquare;
  fieldStrength[0] += magnitude * Math.cos(Math.atan((startPoint[1] - charge[1]) / (startPoint[0] - charge[0])));
  fieldStrength[1] += magnitude * Math.sin(Math.atan((startPoint[1] - charge[1]) / (startPoint[0] - charge[0])));
}

function drawPath(paths, i) {
  let ctx = document.getElementById('lines').getContext('2d');
  ctx.beginPath();
  if (Math.sign(paths[i][0][2]) === 1) ctx.strokeStyle = "#900000";
  else ctx.strokeStyle = "#000090";
  ctx.moveTo(paths[i][0][0], paths[i][0][1]);
  for (var j = 0; j < paths[i].length; j++) {
    ctx.lineTo(paths[i][j][0], paths[i][j][1]);
  }
  ctx.stroke();
}

function drawCharge(charge) {
  let ctx = document.getElementById('lines').getContext('2d');
  ctx.beginPath();
  if (Math.sign(charge[2]) === 1) ctx.fillStyle = "#900000";
  else ctx.fillStyle = "#000090";
  ctx.arc(charge[0], charge[1], Math.sqrt(Math.abs(charge[2])), Math.sqrt(Math.abs(charge[2])), 0, TAU);
  ctx.fill();
}