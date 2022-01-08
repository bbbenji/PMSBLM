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

// Remove line numbers from array
function clean(arr) {
  let forDeletion = [0, 5, 10, 15]
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
}

function avgDev(arr) {
  let avg = arr.reduce((a, b) => a + b) / arr.length;
  avg = ((avg >= 0) ? '+' : '') + avg.toFixed(3);
  document.querySelector('#stats .avg_dev').innerHTML = avg;
}

function plot(arr) {
  // Reverse the array because MBL output is rotated
  arr = arr.reverse();

  let arrs = [], size = 4;
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

function hide() {
  document.querySelectorAll('.hide').forEach(x=>x.classList.add('hidden'))
}

window.onload = function() {
  document.getElementById('convert').onclick = function fun() {

    textarea = document.querySelector('textarea#input');
    textareaValue = textarea.value;
    textareaValue = textareaValue.replace(/\w+:\s*/g, '').trim(); // Remove 'Recv: ' if exists & trim whitespace
    textareaValue = textareaValue.replace(/0[ \t]+1[ \t]+2[ \t]+3\n/g, '').trim(); // Remove '0 1 2 3' if exists & trim whitespace
    let arr = textareaValue.split(/\s+/).map(x=>+x);
    
  // Raw
  //  1  2  3  4
  //  6  7  8  9
  // 11 12 13 14
  // 16 17 18 19
    clean(arr)
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

    convert();
    minMax(arr);
    maxDiff(arr);
    avgDev(arr);
    plot(arr);
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
