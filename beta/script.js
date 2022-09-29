const screwPitch = 0.5
const cw = 'CW&nbsp;&nbsp;<span class="mdi mdi-rotate-right text-danger"></span>'
const ccw = 'CCW <span class="mdi mdi-rotate-left text-primary"></span>'

const source = document.getElementById('source')
const target = document.getElementById('target')
const action = document.getElementById('action')

action.addEventListener('click', () => {
  const raw = clean()
  let rawFlat = raw.flat()
  rawFlat = rawFlat.map(Number)

  plot(raw)
  convert(raw)
  minMax(rawFlat)
  maxDiff(rawFlat)
  avgDev(rawFlat)
})

function clean () {
  let raw = source.value
  raw = raw.replace(/\w+:\s*/g, '').trim() // Remove 'Recv: ' if exists & trim whitespace
  raw = raw.split('\n')
  if (raw[0].trim().match(/^0\s+[\s\d]+\d$/)) raw.shift()
  for (const i in raw) {
    raw[i] = raw[i].trim().replace(/< \d+:\d+:\d+(\s+(AM|PM))?:/g, '').replace(/[\[\]]/g, ' ').replace(/\s+/g, '\t').split('\t')
    if (raw[i][0] === i) raw[i].shift()
  }

  const invertOutput = document.getElementById('invertOutput')
  if (invertOutput.checked) {
    raw.reverse().forEach(function (item) {
      item.reverse()
    })
  }

  return raw
}

// import Plotly from 'plotly.js-dist-min'
function plot (raw) {
  hide()
  const data = [{
    z: raw,
    type: 'surface'
  }]
  const layout = {
    // title: 'Bed Leveling Mesh',
    autosize: true,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    },
    scene: {
      zaxis: {
        autorange: false,
        range: [-1, 1]
      }
      // camera: {
      //   eye: {
      //   x: 0, y: -1.25, z: 1.25
      //   }
      // }
    }
  }
  Plotly.newPlot(target, data, layout, { responsive: true })
}

function convert (raw) {
  const midRow = arrayMid(raw) // middle rows
  let midRowValueAvg
  let midRowFirstValueAvg
  let midRowLastValueAvg
  let firstRowMidValueAvg
  let lastRowMidValueAvg
  if (raw.length % 2 === 0) {
    // Get averages of middle data points
    const midRowValue = [arrayMid(midRow[0]), arrayMid(midRow[1])] // middle values of middle rows
    midRowValueAvg = arraySum(midRowValue) / 4 // average of middle values of middle rows
    const midRowFirstValue = [midRow[0][0], midRow[1][0]] // first values of middle rows
    midRowFirstValueAvg = arraySum(midRowFirstValue) / 2 // average of first values of middle rows
    const midRowLastValue = [midRow[0][midRow[0].length - 1], midRow[1][midRow[1].length - 1]] // last values of middle rows
    midRowLastValueAvg = arraySum(midRowLastValue) / 2 // average of last values of middle rows
    const firstRowMidValue = arrayMid(raw[0]) // middle values of first row
    firstRowMidValueAvg = arraySum(firstRowMidValue) / 2 // average of middle values of first row
    const lastRowMidValue = arrayMid(raw[raw.length - 1]) // middle values of last row
    lastRowMidValueAvg = arraySum(lastRowMidValue) / 2 // average of middle values of last row
  } else {
    midRowValueAvg = arrayMid(midRow[0]) // middle value of middle row
    midRowFirstValueAvg = [midRow[0][0]] // first value of middle row
    midRowLastValueAvg = [midRow[0][midRow[0].length - 1]] // last value of middle row
    firstRowMidValueAvg = arrayMid(raw[0]) // middle value of first row
    lastRowMidValueAvg = arrayMid(raw[raw.length - 1]) // middle value of last row
  }

  const center = midRowValueAvg
  const backLeft = raw[0][0] - center
  const backCenter = firstRowMidValueAvg - center
  const backRight = raw[0][raw.length - 1] - center
  const centerLeft = midRowFirstValueAvg - center
  const centerRight = midRowLastValueAvg - center
  const frontLeft = raw[raw.length - 1][0] - center
  const frontCenter = lastRowMidValueAvg - center
  const frontRight = raw[raw.length - 1][raw.length - 1] - center

  // Evaluate and inject values into DOM
  const array = ['backLeft', 'backCenter', 'backRight', 'centerLeft', 'centerRight', 'frontLeft', 'frontCenter', 'frontRight']
  array.forEach(function (item) {
    document.querySelector('#raw .' + item).innerHTML = relative(eval(item))
    document.querySelector('#degrees .' + item).innerHTML = degrees(eval(item))
    document.querySelector('#fractions .' + item).innerHTML = fractions(eval(item))
  })

  // Calculate the sum of an array
  function arraySum (array) {
    return array.flat(Infinity).map(Number).reduce((acc, curr) => acc + curr, 0)
  }

  // Get the middle element/s of even array
  function arrayMid (raw, ind = 0) {
    if (raw[ind]) {
      return arrayMid(raw, ++ind)
    };
    return ind % 2 !== 0
      ? [raw[(ind - 1) / 2]]
      : [raw[(ind / 2) - 1],
          raw[ind / 2]]
  };

  // Calculate the raw value relative to the center
  function relative (position) {
    let pos = position.toFixed(2)
    if (pos === 0) {
      return '±0.00 mm <span class="mdi mdi-check text-success"></span>'
    } else {
      pos = ((pos >= 0) ? '+' : '') + pos + ' mm <span class="mdi mdi-close text-danger"></span>'
      return pos
    }
  }

  // Calculate the degree value relative to the center
  function degrees (position) {
    let deg = Math.round((position / screwPitch * 360))
    if (deg === 0) {
      return deg + '° <span class="mdi mdi-check text-success"></span>'
    } else {
      deg = Math.abs(deg) + '°' + ' ' + ((deg > 0) ? cw : ccw)
      return deg
    }
  }

  // Calculate the fraction value relative to the center
  function fractions (position) {
    // https://stackoverflow.com/a/23575406
    const gcd = function (a, b) {
      if (b < 0.0000001) return a // Since there is a limited precision we need to limit the value.
      return gcd(b, Math.floor(a % b)) // Discard any fractions due to limitations in precision.
    }

    const abs = Math.abs(position / screwPitch).toFixed(1)
    const len = abs.toString().length - 2
    let denominator = Math.pow(10, len)
    let numerator = abs * denominator
    const divisor = gcd(numerator, denominator)
    numerator /= divisor
    denominator /= divisor

    let rat = Math.floor(numerator) + '/' + Math.floor(denominator)
    rat = ((rat === '0/1') ? 0 : rat)
    if (rat === 0) {
      return rat + ' <span class="mdi mdi-check text-success"></span>'
    } else {
      rat = rat + ' ' + ((position > 0) ? cw : ccw)
      return rat
    }
  }
}

// Calculate maximum and mimum values
function minMax (rawFlat) {
  let min = Math.min(...rawFlat)
  let max = Math.max(...rawFlat)
  min = ((min >= 0) ? '+' : '') + min
  max = ((max >= 0) ? '+' : '') + max
  document.querySelector('#stats .min').innerHTML = min
  document.querySelector('#stats .max').innerHTML = max
}

// Calculate the maximum difference
function maxDiff (rawFlat) {
  const diff = Math.max(...rawFlat) - Math.min(...rawFlat)
  document.querySelector('#stats .max_diff').innerHTML = diff.toFixed(3)
  // If the maximum difference is below threshold, initiate fireworks
  if (diff <= 0.02) {
    fireworks()
  }
}

// Calculate the average devication
function avgDev (rawFlat) {
  let avg = rawFlat.reduce((a, b) => a + b) / rawFlat.length
  avg = ((avg >= 0) ? '+' : '') + avg.toFixed(3)
  document.querySelector('#stats .avg_dev').innerHTML = avg
}

// Hide any elements in the DOM with a class of .hide
function hide () {
  document.querySelectorAll('.hide').forEach(x => x.classList.add('hidden'))
}

// Initiate fireworks
function fireworks () {
  const duration = 5 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  function randomInRange (min, max) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }))
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }))
  }, 250)
}

// Popovers
function popovers () {
  // Set popover data attributes
  document.querySelectorAll('.backLeft').forEach(x => x.setAttribute('title', 'Back Left'))
  document.querySelectorAll('.backLeft').forEach(x => x.setAttribute('data-content', "<img src='../images/back-left.png' class='img-fluid'>"))
  document.querySelectorAll('.backCenter').forEach(x => x.setAttribute('title', 'Back Center'))
  document.querySelectorAll('.backCenter').forEach(x => x.setAttribute('data-content', "<img src='../images/back-center.png' class='img-fluid'>"))
  document.querySelectorAll('.backRight').forEach(x => x.setAttribute('title', 'Back Right'))
  document.querySelectorAll('.backRight').forEach(x => x.setAttribute('data-content', "<img src='../images/back-right.png' class='img-fluid'>"))
  document.querySelectorAll('.centerLeft').forEach(x => x.setAttribute('title', 'Center Left'))
  document.querySelectorAll('.centerLeft').forEach(x => x.setAttribute('data-content', "<img src='../images/center-left.png' class='img-fluid'>"))
  document.querySelectorAll('.center_center').forEach(x => x.setAttribute('title', 'Center Center'))
  document.querySelectorAll('.center_center').forEach(x => x.setAttribute('data-content', "<img src='../images/center-center.png' class='img-fluid'>"))
  document.querySelectorAll('.centerRight').forEach(x => x.setAttribute('title', 'Center Right'))
  document.querySelectorAll('.centerRight').forEach(x => x.setAttribute('data-content', "<img src='../images/center-right.png' class='img-fluid'>"))
  document.querySelectorAll('.frontLeft').forEach(x => x.setAttribute('title', 'Front Left'))
  document.querySelectorAll('.frontLeft').forEach(x => x.setAttribute('data-content', "<img src='../images/front-left.png' class='img-fluid'>"))
  document.querySelectorAll('.frontCenter').forEach(x => x.setAttribute('title', 'Front Center'))
  document.querySelectorAll('.frontCenter').forEach(x => x.setAttribute('data-content', "<img src='../images/front-center.png' class='img-fluid'>"))
  document.querySelectorAll('.frontRight').forEach(x => x.setAttribute('title', 'Front Right'))
  document.querySelectorAll('.frontRight').forEach(x => x.setAttribute('data-content', "<img src='../images/front-right.png' class='img-fluid'>"))
  // Initiate popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'))
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      html: true,
      trigger: 'hover'
    })
  })
}
popovers()
