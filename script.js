screw_pitch = 0.5;
cw = 'CW&nbsp;&nbsp;<span class="mdi mdi-rotate-right text-danger"></span>';
ccw = 'CCW <span class="mdi mdi-rotate-left text-primary"></span>';

function raw(position) {
  pos = position.toFixed(2);
  if (pos == 0) {
    return '±0.00 mm <span class="mdi mdi-check text-success"></span>';
  } else {
    pos = ((pos >= 0) ? '+' : '') + pos + ' mm <span class="mdi mdi-close text-danger"></span>'
    return pos;
  }
}

function degrees(position) {
  deg = Math.round((position/screw_pitch*360));
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
  abs = Math.abs(position/screw_pitch).toFixed(1);
  let len = abs.toString().length - 2;
  let denominator = Math.pow(10, len);
  let numerator = abs * denominator;
  let divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  
  rat = Math.floor(numerator) + '/' + Math.floor(denominator);
  rat = ((rat == '0/1') ? 0 : rat);
  if (rat == 0) {
    return rat + ' <span class="mdi mdi-check text-success"></span>';
  } else {
    rat = rat + ' ' + ((position > 0) ? cw : ccw);
    return rat;
  }
}

function convert() {
  const array = ['back_left', 'back_center', 'back_right', 'center_left', 'center_right', 'front_left', 'front_center', 'front_right']
  array.forEach(function (item) {
    document.querySelector('#raw .' + item).innerHTML = raw(window[item]);
    document.querySelector('#degrees .' + item).innerHTML = degrees(window[item]);
    document.querySelector('#fractions .' + item).innerHTML = fractions(window[item]);
  });
}

// Remove line numbers from array for Mini
function cleanMini(arr) {
  let forDeletion = [0, 5, 10, 15]
  for (let i = forDeletion.length -1; i >= 0; i--)
  arr.splice(forDeletion[i],1);
}

// Remove line numbers from array for Marlin 7x7
function cleanMarlin7(arr) {
  let forDeletion = [0, 8, 16, 24, 32, 40, 48]
  for (let i = forDeletion.length -1; i >= 0; i--)
  arr.splice(forDeletion[i],1);
}

function minMax(arr) {
  let min = Math.min(...arr);
  let max = Math.max(...arr);
  min = ((min >= 0) ? '+' : '') + min;
  max = ((max >= 0) ? '+' : '') + max;
  document.querySelector('#stats .min').innerHTML = min;
  document.querySelector('#stats .max').innerHTML = max;
}

function maxDiff(arr) {
  let diff = Math.max(...arr) - Math.min(...arr);
  document.querySelector('#stats .max_diff').innerHTML = diff.toFixed(3);
  if (diff <= 0.02) {
    fireworks();
  }
}

function avgDev(arr) {
  let avg = arr.reduce((a, b) => a + b) / arr.length;
  avg = ((avg >= 0) ? '+' : '') + avg.toFixed(3);
  document.querySelector('#stats .avg_dev').innerHTML = avg;
}

function plot(arr, points) {
  // Reverse the array because MBL output is rotated
  arr = arr.reverse();

  let arrs = [], size = points;
  while (arr.length > 0)
  arrs.push(arr.splice(0, size));

  // Plotly specific
  let data = [{
            z: arrs,
            type: 'surface'
          }];      
  let layout = {
    // title: '',
    autosize: true,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    },
    scene: {
      xaxis: {
        visible: false
      },
      yaxis: {
        visible: false
      },
      zaxis: {
        range: [-2, 2]
      }
    }
  };
  Plotly.newPlot('ploty', data, layout);
}

function fireworks() {
  var duration = 5 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();
  
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
  
    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

function hide() {
  document.querySelectorAll('.hide').forEach(x=>x.classList.add('hidden'))
}

window.onload = function() {
  document.getElementById('convert').onclick = function fun() {

    textarea = document.querySelector('textarea#input');
    textareaValue = textarea.value;
    let arr;
    let points;

    var e = document.getElementById('outputType');
    var value = e.value;
    if (value == 'prusaMini') {
      points = 4;
      textareaValue = textareaValue.replace(/\w+:\s*/g, '').trim(); // Remove 'Recv: ' if exists & trim whitespace
      textareaValue = textareaValue.replace(/0[ \t]+1[ \t]+2[ \t]+3\n/g, '').trim(); // Remove '0 1 2 3' if exists & trim whitespace
      arr = textareaValue.split(/\s+/).map(x=>+x);
      
      // Raw
      //  1  2  3  4
      //  6  7  8  9
      // 11 12 13 14
      // 16 17 18 19
      cleanMini(arr)
      // Cleaned
      //  0  1  2  3
      //  4  5  6  7
      //  8  9 10 11
      // 12 13 14 15
  
      center = (arr[5]+arr[6]+arr[9]+arr[10])/4;
  
      back_left = arr[12] - center;
      back_center = ((arr[13]+arr[14])/2) - center;
      back_right = arr[15] - center;
      
      center_left = ((arr[4]+arr[8])/2) - center;
      center_right = ((arr[7]+arr[11])/2) - center;
      
      front_left = arr[0] - center;
      front_center = ((arr[1]+arr[2])/2) - center;
      front_right = arr[3] - center;
    } else if (value == 'marlin7') {
      points = 7;
      textareaValue = textareaValue.replace(/\w+:\s*/g, '').trim(); // Remove 'Recv: ' if exists & trim whitespace
      textareaValue = textareaValue.replace(/0[ \t]+1[ \t]+2[ \t]+3[ \t]+4[ \t]+5[ \t]+6\n/g, '').trim(); // Remove '0 1 2 3 4 5 6 7' if exists & trim whitespace
      arr = textareaValue.split(/\s+/).map(x=>+x);
      
      // Raw
      //  1  2  3  4  5  6  7
      //  9 10 11 12 13 14 15
      // 17 18 19 20 21 22 23
      // 25 26 27 28 29 30 31
      // 33 34 35 36 37 38 39
      // 41 42 43 44 45 46 47
      // 49 50 51 52 53 54 55
      cleanMarlin7(arr)
      // Cleaned
      //  0  1  2  3  4  5  6
      //  7  8  9 10 11 12 13
      // 14 15 16 17 18 19 20
      // 21 22 23 24 25 26 27
      // 28 29 30 31 32 33 34
      // 35 36 37 38 39 40 41
      // 42 43 44 45 46 47 48

      //  0  1      2  3  4     5  6
      //  7  8      9 10 11    12 13

      // 14 15    16 17 18    19 20
      // 21 22    23 24 25    26 27
      // 28 29    30 31 32    33 34

      // 35 36     37 38 39    40 41
      // 42 43     44 45 46    47 48
  
      center = (arr[16]+arr[17]+arr[18]+arr[23]+arr[24]+arr[25]+arr[30]+arr[31]+arr[32])/9;
  
      back_left = ((arr[0]+arr[1]+arr[7]+arr[8])/4) - center;
      back_center = ((arr[2]+arr[3]+arr[4]+arr[9]+arr[10]+arr[11])/6) - center;
      back_right = arr[15] - center;
      
      center_left = ((arr[14]+arr[15]+arr[21]+arr[22]+arr[28]+arr[29])/6) - center;
      center_right = ((arr[19]+arr[20]+arr[26]+arr[27]+arr[33]+arr[34])/6) - center;
      
      front_left = ((arr[35]+arr[36]+arr[42]+arr[43])/4) - center;
      front_center = ((arr[37]+arr[38]+arr[39]+arr[44]+arr[45]+arr[46])/6) - center;
      front_right = ((arr[40]+arr[41]+arr[47]+arr[48])/4) - center;
    
    }

    convert();
    minMax(arr);
    maxDiff(arr);
    avgDev(arr);
    plot(arr, points);
    hide();
  }
  popovers()
}

// Popovers
function popovers() {
  // Set popover data attributes
  document.querySelectorAll('.back_left').forEach(x=>x.setAttribute('title', 'Back Left'))
  document.querySelectorAll('.back_left').forEach(x=>x.setAttribute('data-content', "<img src='images/back-left.png' class='img-fluid'>"))
  document.querySelectorAll('.back_center').forEach(x=>x.setAttribute('title', 'Back Center'))
  document.querySelectorAll('.back_center').forEach(x=>x.setAttribute('data-content', "<img src='images/back-center.png' class='img-fluid'>"))
  document.querySelectorAll('.back_right').forEach(x=>x.setAttribute('title', 'Back Right'))
  document.querySelectorAll('.back_right').forEach(x=>x.setAttribute('data-content', "<img src='images/back-right.png' class='img-fluid'>"))
  document.querySelectorAll('.center_left').forEach(x=>x.setAttribute('title', 'Center Left'))
  document.querySelectorAll('.center_left').forEach(x=>x.setAttribute('data-content', "<img src='images/center-left.png' class='img-fluid'>"))
  document.querySelectorAll('.center_center').forEach(x=>x.setAttribute('title', 'Center Center'))
  document.querySelectorAll('.center_center').forEach(x=>x.setAttribute('data-content', "<img src='images/center-center.png' class='img-fluid'>"))
  document.querySelectorAll('.center_right').forEach(x=>x.setAttribute('title', 'Center Right'))
  document.querySelectorAll('.center_right').forEach(x=>x.setAttribute('data-content', "<img src='images/center-right.png' class='img-fluid'>"))
  document.querySelectorAll('.front_left').forEach(x=>x.setAttribute('title', 'Front Left'))
  document.querySelectorAll('.front_left').forEach(x=>x.setAttribute('data-content', "<img src='images/front-left.png' class='img-fluid'>"))
  document.querySelectorAll('.front_center').forEach(x=>x.setAttribute('title', 'Front Center'))
  document.querySelectorAll('.front_center').forEach(x=>x.setAttribute('data-content', "<img src='images/front-center.png' class='img-fluid'>"))
  document.querySelectorAll('.front_right').forEach(x=>x.setAttribute('title', 'Front Right'))
  document.querySelectorAll('.front_right').forEach(x=>x.setAttribute('data-content', "<img src='images/front-right.png' class='img-fluid'>"))
  // Initiate popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      html: true,
      trigger: 'hover'
    })
  })
}
