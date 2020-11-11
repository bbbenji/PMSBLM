screw_pitch = 0.5;

function raw(position) {
  pos = position.toFixed(2);
  pos =  ((pos > 0) ? '+' : '') + pos
  return pos;
}

function degrees(position) {
  deg = Math.round((position/screw_pitch*360));
  deg = Math.abs(deg) + '°' + ' ' + ((deg > 0) ? 'CW' : 'CCW');
  return deg;
}

// https://stackoverflow.com/a/23575406
var gcd = function(a, b) {
  if (b < 0.0000001) return a; // Since there is a limited precision we need to limit the value.
  return gcd(b, Math.floor(a % b)); // Discard any fractions due to limitations in precision.
};
function fractions(position) {
  abs = Math.abs(position/screw_pitch).toFixed(1);
  var len = abs.toString().length - 2;
  var denominator = Math.pow(10, len);
  var numerator = abs * denominator;
  var divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  
  rat = Math.floor(numerator) + '/' + Math.floor(denominator);
  rat = ((rat == '0/1') ? 0 : rat);
  rat = rat + ' ' + ((position > 0) ? 'CW' : 'CCW');
  return rat;
}

function convert() {
  const array = ['top_left', 'top_middle', 'top_right', 'middle_left', 'middle_right', 'bottom_left', 'bottom_middle', 'bottom_right']
  array.forEach(function (item) {
    document.querySelector('#raw .' + item).innerHTML = raw(window[item]);
    document.querySelector('#degrees .' + item).innerHTML = degrees(window[item]);
    document.querySelector('#fractions .' + item).innerHTML = fractions(window[item]);
  });
}

function plot(arr) {

  // Remove line numbers from array
  let forDeletion = [0, 5, 10, 15]
  for (var i = forDeletion.length -1; i >= 0; i--)
  arr.splice(forDeletion[i],1);

  // Reverse the array because MBL output is backwards
  arr = arr.reverse();

  // Make array of arrays
  var arrs = [], size = 4;
  while (arr.length > 0)
  arrs.push(arr.splice(0, size));
  
  // Plotly specific
  var data = [{
            z: arrs,
            type: 'surface'
          }];      
  var layout = {
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
    textareaValue = textareaValue.replace(/0[ \t]+1[ \t]+2[ \t]+3\n/g, '').trim(); // Remove '0 1 2 3' if exists & trim whitespace
    let arr = textareaValue.split(/\s+/).map(x=>+x);

    center = (arr[7]+arr[8]+arr[12]+arr[13])/4;

    top_left = arr[16] - center;
    top_middle = ((arr[17]+arr[18])/2) - center;
    top_right = arr[19] - center;
    
    middle_left = ((arr[6]+arr[11])/2) - center;
    middle_right = ((arr[9]+arr[14])/2) - center;
    
    bottom_left = arr[1] - center;
    bottom_middle = ((arr[2]+arr[3])/2) - center;
    bottom_right = arr[4] - center;

    convert();
    plot(arr);
    hide()
  }
}

//  1  2  3  4
//  6  7  8  9
// 11 12 13 14
// 16 17 18 19
