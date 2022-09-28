var screw_pitch = 0.5;
var cw = 'CW&nbsp;&nbsp;<span class="mdi mdi-rotate-right text-danger"></span>';
var ccw = 'CCW <span class="mdi mdi-rotate-left text-primary"></span>';

var source = document.getElementById('source');
var target = document.getElementById('target');
var action = document.getElementById('action');

function clean() {
  var raw = source.value;
  raw = raw.replace(/\w+:\s*/g, '').trim(); // Remove 'Recv: ' if exists & trim whitespace
  raw = raw.split('\n');
  if (raw[0].trim().match(/^0\s+[\s\d]+\d$/)) raw.shift();
  for (var i in raw){
    raw[i] = raw[i].trim().replace(/< \d+:\d+:\d+(\s+(AM|PM))?:/g, '').replace(/[\[\]]/g,' ').replace(/\s+/g, '\t').split('\t');
    if (raw[i][0] == i) raw[i].shift();
  }

  var invertOutput = document.getElementById('invertOutput');
  if (invertOutput.checked) {
    raw.reverse().forEach(function (item) {
      item.reverse();
    });
  }

  var rawFlat = raw.flat();
  rawFlat = rawFlat.map(Number);

  plot(raw);
  convert(raw);
  minMax(rawFlat);
  maxDiff(rawFlat);
  avgDev(rawFlat);
}

// import Plotly from 'plotly.js-dist-min'
function plot(raw) {
  hide();
  var data = [{
    z: raw,
    type: 'surface'
  }];
  var layout = {
    //title: 'Bed Leveling Mesh',
    autosize: true,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    },
    scene: {
      zaxis: {
        autorange: false,
        range: [-1,1]
      },
      // camera: {
      //   eye: {
      //   x: 0, y: -1.25, z: 1.25
      //   }
      // }
    }
  };
  Plotly.newPlot(target, data, layout, {responsive: true});
}

function convert(raw){
  const arraySum = array => array.flat(Infinity).map(Number).reduce((acc,curr)=>acc+curr, 0);

  var midRow = arrayMid(raw); // middle rows
  var midRowValueAvg;
  var midRowFirstValueAvg;
  var midRowLastValueAvg;
  var firstRowMidValueAvg;
  var lastRowMidValueAvg;
  if (raw.length % 2 == 0) {
    // Get averages of middle data points
    var midRowValue = [arrayMid(midRow[0]), arrayMid(midRow[1])] // middle values of middle rows
    midRowValueAvg = arraySum(midRowValue) / 4; // average of middle values of middle rows
    var midRowFirstValue = [midRow[0][0], midRow[1][0]] // first values of middle rows
    midRowFirstValueAvg = arraySum(midRowFirstValue) / 2; // average of first values of middle rows
    var midRowLastValue = [midRow[0][midRow[0].length - 1], midRow[1][midRow[1].length - 1]] // last values of middle rows
    midRowLastValueAvg = arraySum(midRowLastValue) / 2; // average of last values of middle rows
    var firstRowMidValue = arrayMid(raw[0]); // middle values of first row
    firstRowMidValueAvg = arraySum(firstRowMidValue) / 2; // average of middle values of first row
    var lastRowMidValue = arrayMid(raw[raw.length - 1]); // middle values of last row
    lastRowMidValueAvg = arraySum(lastRowMidValue) / 2; // average of middle values of last row
  } else {
    midRowValueAvg = arrayMid(midRow[0]);
    midRowFirstValueAvg = [midRow[0][0]];
    midRowLastValueAvg = [midRow[0][midRow[0].length - 1]];
    firstRowMidValueAvg = arrayMid(raw[0]);
    lastRowMidValueAvg = arrayMid(raw[raw.length - 1]);
  }

  var center = midRowValueAvg;

  var back_left = raw[0][0] - center;
  var back_center = firstRowMidValueAvg - center;
  var back_right = raw[0][raw.length - 1] - center;
  
  var center_left = midRowFirstValueAvg - center;
  var center_right = midRowLastValueAvg - center;
  
  var front_left = raw[raw.length - 1][0] - center;
  var front_center = lastRowMidValueAvg - center;
  var front_right = raw[raw.length - 1][raw.length - 1] - center;

  const array = ['back_left', 'back_center', 'back_right', 'center_left', 'center_right', 'front_left', 'front_center', 'front_right']
  array.forEach(function (item) {
    document.querySelector('#raw .' + item).innerHTML = relative(eval(item));
    document.querySelector('#degrees .' + item).innerHTML = degrees(eval(item));
    document.querySelector('#fractions .' + item).innerHTML = fractions(eval(item));
  });

}

function relative(position) {
  var pos = position.toFixed(2);
  if (pos == 0) {
    return '±0.00 mm <span class="mdi mdi-check text-success"></span>';
  } else {
    pos = ((pos >= 0) ? '+' : '') + pos + ' mm <span class="mdi mdi-close text-danger"></span>'
    return pos;
  }
}

function degrees(position) {
  var deg = Math.round((position/screw_pitch*360));
  if (deg == 0) {
    return deg + '° <span class="mdi mdi-check text-success"></span>';
  } else {
    deg = Math.abs(deg) + '°' + ' ' + ((deg > 0) ? cw : ccw);
    return deg;
  }
}

// https://stackoverflow.com/a/23575406
let gcd = function(a, b) {
  if (b < 0.0000001) return a; // Since there is a limited precision we need to limit the value.
  return gcd(b, Math.floor(a % b)); // Discard any fractions due to limitations in precision.
};
function fractions(position) {
  var abs = Math.abs(position/screw_pitch).toFixed(1);
  let len = abs.toString().length - 2;
  let denominator = Math.pow(10, len);
  let numerator = abs * denominator;
  let divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  
  var rat = Math.floor(numerator) + '/' + Math.floor(denominator);
  rat = ((rat == '0/1') ? 0 : rat);
  if (rat == 0) {
    return rat + ' <span class="mdi mdi-check text-success"></span>';
  } else {
    rat = rat + ' ' + ((position > 0) ? cw : ccw);
    return rat;
  }
}

// Calculate maximum and mimum
function minMax(rawFlat) {
  let min = Math.min(...rawFlat);
  let max = Math.max(...rawFlat);
  min = ((min >= 0) ? '+' : '') + min;
  max = ((max >= 0) ? '+' : '') + max;
  document.querySelector('#stats .min').innerHTML = min;
  document.querySelector('#stats .max').innerHTML = max;
}

// Calculate maximum devication
function maxDiff(rawFlat) {
  let diff = Math.max(...rawFlat) - Math.min(...rawFlat);
  document.querySelector('#stats .max_diff').innerHTML = diff.toFixed(3);
  if (diff <= 0.02) {
    // fireworks();
  }
}

// Calculate average devication
function avgDev(rawFlat) {
  let avg = rawFlat.reduce((a, b) => a + b) / rawFlat.length;
  avg = ((avg >= 0) ? '+' : '') + avg.toFixed(3);
  document.querySelector('#stats .avg_dev').innerHTML = avg;
}

// Get middle elements of even array
function arrayMid(raw, ind = 0) {
    if(raw[ind]){
        return arrayMid(raw, ++ind);
    };
    return ind % 2 !== 0 ? [raw[(ind-1) / 2]] : [raw[(ind/2)-1],
    raw[ind/2]];
  };

function hide() {
  document.querySelectorAll('.hide').forEach(x=>x.classList.add('hidden'))
}

action.addEventListener('click', () => clean());
// action.addEventListener('click', ()=>{
// 	clean();
// })