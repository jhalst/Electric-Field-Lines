// each charge of the form [x, y, charge]
let charges = [];
let sliders = [];

// create sliders to control the charges
function askForPoints() {
  let points = window.prompt("How many points do you want to graph?");
  for (var i = 0; i < points; i++) {
    slidersForCharge(i);
  }
  for (let i = 0; i < points; i++) {
    let currentSliders = sliders[2*i + 1];
    charges.push([JSON.parse(currentSliders[0].value), JSON.parse(currentSliders[1].value), JSON.parse(currentSliders[2].value)]);
  }
}

function slidersForCharge(i) {
  sliders.push(document.createElement('div'));
  sliders.push([]);
  createSlider(10, window.innerWidth - 10, i);
  createSlider(10, window.innerHeight - 10, i);
  createSlider(-200, 200, i);
  document.body.insertBefore(sliders[2*i], document.getElementById('lines'));
}

function createSlider(min, max, i) {
  newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = min;
  newSlider.max = max;
  newSlider.addEventListener("input", redrawLines);
  sliders[2 * i].appendChild(newSlider);
  sliders[2 * i + 1].push(newSlider);
}

// draw field lines when a slider is changed
function redrawLines(e) {
  index = findElement(e);  
  charges[index[0]][index[1]] = JSON.parse(e.target.value);
  drawFieldLines();
}

function findElement(e) {
  let i = 1
  while (true) {
    for (var j = 0; j < 3; j++)
      if (sliders[i][j] === e.target)
        return [.5 * (i - 1), j];
    i += 2;
  }
}

function drawFieldLines() {
  let paths = calculateFieldLines();

  let c = document.getElementById('lines');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  let ctx = c.getContext('2d');
  for (let i = 0; i < paths.length; i++) {
    drawPath(paths, i);
  }
  for (var i = 0; i < charges.length; i++) {
    ctx.beginPath();
    if (Math.sign(charges[i][2]) === 1) {
      ctx.fillStyle = "#900000"
    } else {
      ctx.fillStyle = "#000090"
    }
    ctx.arc(charges[i][0], charges[i][1], 10, 10, 0, 6.283);
    ctx.fill();
  }
}
// creates paths array of the form [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...], ...]
function calculateFieldLines() {
  let paths = [];
  for (let i = 0; i < charges.length; i++) {
    let startAngle = 6.28318531 * Math.random();
    let angleStep = 6.28318531 / Math.floor(1 + Math.abs(charges[i][2]));
    for (let j = 0; j <= Math.abs(charges[i][2]); j++)
      paths.push(calculatePath([charges[i][0] + 10 * Math.cos(startAngle + j * angleStep), charges[i][1] + 10 * Math.sin(startAngle + j * angleStep), charges[i][2]]));
  }
  return paths;
}

function calculatePath(startPoint) {
  if (startPoint[1] > window.innerHeight || startPoint[1] < 0 || startPoint[0] > window.innerWidth || startPoint[0] < 0) {
    return [startPoint];
  }
  let fieldStrength = [0, 0];
  for (var i = 0; i < charges.length; i++) {
    let distanceSquare = (startPoint[0] - charges[i][0]) ** 2 + (startPoint[1] - charges[i][1]) ** 2;
    if (distanceSquare < 25) {
      return [startPoint];
    }
    let magnitude = Math.sign(startPoint[0] - charges[i][0]) * charges[i][2] * Math.sign(startPoint[2]) / distanceSquare;
    fieldStrength[0] += magnitude * Math.cos(Math.atan((startPoint[1] - charges[i][1]) / (startPoint[0] - charges[i][0])));
    fieldStrength[1] += magnitude * Math.sin(Math.atan((startPoint[1] - charges[i][1]) / (startPoint[0] - charges[i][0])));
  }
  fieldStrength = [fieldStrength[0] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2), fieldStrength[1] / Math.sqrt(fieldStrength[0] ** 2 + fieldStrength[1] ** 2)];
  return [startPoint].concat(calculatePath([startPoint[0] + fieldStrength[0], startPoint[1] + fieldStrength[1], startPoint[2]]));
}

function drawPath(paths, i) {
  ctx = document.getElementById('lines').getContext('2d');
  ctx.beginPath();
  if (Math.sign(paths[i][0][2]) === 1) {
    ctx.strokeStyle = "#900000"
  } else {
    ctx.strokeStyle = "#000090"
  }
  ctx.moveTo(paths[i][0][0], paths[i][0][1]);
  for (var j = 0; j < paths[i].length; j++) {
    ctx.lineTo(paths[i][j][0], paths[i][j][1]);
  }
  ctx.stroke();
}

window.onresize = function () {
  updateSliders();
  drawFieldLines();
}

function updateSliders() {
  for (let i = 0; i < sliders.length; i += 2) {
    sliders[i + 1][0].max = window.innerWidth;
    sliders[i + 1][1].min = window.innerHeight;
  } 
}