// Constants for screw pitch and rotation directions
const screwPitch = 0.5;
const cw =
  'CW&nbsp;&nbsp;<span class="mdi mdi-rotate-right text-danger"></span>';
const ccw = 'CCW <span class="mdi mdi-rotate-left text-primary"></span>';

// DOM elements
const source = document.getElementById("source");
const target = document.getElementById("target");
const action = document.getElementById("action");

// Event listener for the 'action' button click. It processes the data and updates the UI accordingly.
action.addEventListener("click", () => {
  // Clean and process the raw data
  const raw = clean();
  let rawFlat = raw.flat().map(Number); // Flatten and convert all elements to numbers

  // Perform various data conversions and calculations
  convert(raw); // Convert the raw data
  minMax(rawFlat); // Calculate and display the minimum and maximum values
  maxDiff(rawFlat); // Calculate and display the maximum difference
  avgDev(rawFlat); // Calculate and display the average deviation

  // Plot the processed data
  plot(raw);
});

// Cleans and processes raw string data from a source input.
function clean() {
  // Extract and clean the raw input data
  let raw = source.value
    .replace(/\w+:\s*/g, "") // Remove 'Recv: ' or similar prefixes
    .replace(/\|/g, "") // Remove '|'
    .replace(/^[ \t]*\r?\n/gm, "") // Remove blank lines
    .trim()
    .split("\n"); // Split into lines

  // Remove trailing and leading column numbers
  if (raw[raw.length - 1].trim().match(/^0\s+[\s\d]+\d$/)) {
    raw.pop();
  }
  if (raw[0].trim().match(/^0\s+[\s\d]+\d$/)) {
    raw.shift();
  }

  // Process each line
  raw = raw.map((line, index) => {
    let processedLine = line
      .trim()
      .replace(/< \d+:\d+:\d+(\s+(AM|PM))?:/g, "") // Remove timestamps
      .replace(/[\[\]]/g, " ") // Replace brackets with spaces
      .replace(/\s+/g, "\t") // Normalize whitespace to tabs
      .split("\t"); // Split by tabs

    // Remove row numbers if they match a pattern
    if (
      +processedLine[0] === raw.length - index - 1 ||
      processedLine[0] === String(index)
    ) {
      processedLine.shift();
    }

    return processedLine;
  });

  // Optionally invert the output
  const invertOutput = document.getElementById("invertOutput");
  if (invertOutput.checked) {
    raw = raw.map((item) => item.reverse()).reverse();
  }

  return raw;
}

// import Plotly from 'plotly.js-dist-min'
function plot(raw) {
  const flipOutput = document.getElementById("flipOutput");
  if (flipOutput.checked) {
    raw.reverse();
  }

  hide();
  const data = [
    {
      z: raw,
      type: "surface",
    },
  ];
  const layout = {
    // title: 'Bed Leveling Mesh',
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
        range: [-1, 1],
      },
      camera: {
        eye: { x: 0, y: -2.5, z: 1 }, // Adjust x, y, z values to change the camera view
        up: { x: 0, y: 0, z: 1 }, // This ensures that the Z-axis is pointing upwards
      },
    },
  };
  Plotly.newPlot(target, data, layout, { responsive: true });
}

function convert(raw) {
  // Extract the middle row(s) from the array
  const midRow = arrayMid(raw);
  let midRowValueAvg,
    midRowFirstValueAvg,
    midRowLastValueAvg,
    firstRowMidValueAvg,
    lastRowMidValueAvg;

  // Calculate averages based on whether the number of rows is even or odd
  if (raw.length % 2 === 0) {
    // Calculate averages for even number of rows
    const midRowValue = [...arrayMid(midRow[0]), ...arrayMid(midRow[1])]; // Middle values of middle rows
    midRowValueAvg = arraySum(midRowValue) / midRowValue.length; // Average of middle values of middle rows

    const midRowFirstValue = [midRow[0][0], midRow[1][0]]; // First values of middle rows
    midRowFirstValueAvg = arraySum(midRowFirstValue) / midRowFirstValue.length; // Average of first values of middle rows

    const midRowLastValue = [
      midRow[0][midRow[0].length - 1],
      midRow[1][midRow[1].length - 1],
    ]; // Last values of middle rows
    midRowLastValueAvg = arraySum(midRowLastValue) / midRowLastValue.length; // Average of last values of middle rows

    firstRowMidValueAvg = arraySum(arrayMid(raw[0])) / 2; // Average of middle values of first row
    lastRowMidValueAvg = arraySum(arrayMid(raw[raw.length - 1])) / 2; // Average of middle values of last row
  } else {
    // Calculate averages for odd number of rows
    midRowValueAvg = arrayMid(midRow[0])[0]; // Middle value of middle row
    midRowFirstValueAvg = midRow[0][0]; // First value of middle row
    midRowLastValueAvg = midRow[0][midRow[0].length - 1]; // Last value of middle row
    firstRowMidValueAvg = arrayMid(raw[0])[0]; // Middle value of first row
    lastRowMidValueAvg = arrayMid(raw[raw.length - 1])[0]; // Middle value of last row
  }

  const center = midRowValueAvg;
  const backLeft = raw[0][0] - center;
  const backCenter = firstRowMidValueAvg - center;
  const backRight = raw[0][raw.length - 1] - center;
  const centerLeft = midRowFirstValueAvg - center;
  const centerRight = midRowLastValueAvg - center;
  const frontLeft = raw[raw.length - 1][0] - center;
  const frontCenter = lastRowMidValueAvg - center;
  const frontRight = raw[raw.length - 1][raw.length - 1] - center;

  // Evaluate and inject values into DOM
  const array = [
    "backLeft",
    "backCenter",
    "backRight",
    "centerLeft",
    "centerRight",
    "frontLeft",
    "frontCenter",
    "frontRight",
  ];
  array.forEach(function (item) {
    document.querySelector("#raw ." + item).innerHTML = relative(eval(item));
    document.querySelector("#degrees ." + item).innerHTML = degrees(eval(item));
    document.querySelector("#fractions ." + item).innerHTML = fractions(
      eval(item)
    );
  });

  // Calculate the sum of an array
  function arraySum(array) {
    return array
      .flat(Infinity)
      .map(Number)
      .reduce((acc, curr) => acc + curr, 0);
  }

  // Recursively finds the middle element(s) of an array.
  function arrayMid(raw, ind = 0) {
    if (raw[ind] === undefined) {
      return ind % 2 !== 0
        ? [raw[(ind - 1) / 2]]
        : [raw[ind / 2 - 1], raw[ind / 2]];
    }
    return arrayMid(raw, ++ind);
  }

  // Calculates the position relative to the center and formats it for display.
  function relative(position) {
    const pos = position.toFixed(2);
    if (pos === "0.00") {
      return '±0.00 mm <span class="mdi mdi-check text-success"></span>';
    }
    return `${
      pos >= 0 ? "+" : ""
    }${pos} mm <span class="mdi mdi-close text-danger"></span>`;
  }

  //Converts a position to degrees relative to the screw pitch and formats it for display.
  function degrees(position) {
    let deg = Math.round((position / screwPitch) * 360);
    if (deg === 0) {
      return '0° <span class="mdi mdi-check text-success"></span>';
    }
    return `${Math.abs(deg)}° ${deg > 0 ? cw : ccw}`;
  }

  // Calculates the fractional representation of a position relative to the center.
  function fractions(position) {
    // Function to calculate the greatest common divisor
    const gcd = (a, b) => {
      if (b < 0.0000001) return a; // Limiting value due to precision limitations
      return gcd(b, Math.floor(a % b)); // Using recursion for gcd calculation
    };

    // Calculate the absolute value of the position divided by the screw pitch and fix to 1 decimal place
    const abs = Math.abs(position / screwPitch).toFixed(1);

    // Calculate the length of the decimal part
    const len = abs.toString().length - 2;

    // Determine the denominator as a power of 10 based on the length of the decimal part
    let denominator = Math.pow(10, len);
    let numerator = abs * denominator;

    // Simplify the fraction by dividing both numerator and denominator by their gcd
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;

    // Construct the fraction string
    let fraction = Math.floor(numerator) + "/" + Math.floor(denominator);

    // If the fraction is '0/1', treat it as 0 and append a checkmark icon
    if (fraction === "0/1") {
      return '0 <span class="mdi mdi-check text-success"></span>';
    } else {
      // Append clockwise or counterclockwise symbol based on position
      fraction += " " + (position > 0 ? cw : ccw);
      return fraction;
    }
  }
}

// Updates minimum and maximum values in the DOM based on the rawFlat array
function minMax(rawFlat) {
  // Find minimum and maximum values in the array
  let min = Math.min(...rawFlat);
  let max = Math.max(...rawFlat);

  // Prefix with '+' if the values are non-negative
  min = (min >= 0 ? "+" : "") + min;
  max = (max >= 0 ? "+" : "") + max;

  // Update the DOM elements with the calculated min and max values
  document.querySelector("#stats .min").textContent = min;
  document.querySelector("#stats .max").textContent = max;
}

// Updates the maximum difference in the DOM and triggers fireworks if the condition is met
function maxDiff(rawFlat) {
  // Calculate the difference between the maximum and minimum values
  const diff = Math.max(...rawFlat) - Math.min(...rawFlat);

  // Update the DOM element with the calculated difference
  document.querySelector("#stats .max_diff").textContent = diff.toFixed(3);

  // Trigger fireworks if the difference is below or equal to the threshold (0.02)
  if (diff <= 0.02) {
    fireworks();
  }
}

// Updates the average deviation in the DOM based on the rawFlat array
function avgDev(rawFlat) {
  // Calculate the average value
  let avg = rawFlat.reduce((a, b) => a + b, 0) / rawFlat.length;

  // Prefix with '+' if the average is non-negative and format to 3 decimal places
  avg = (avg >= 0 ? "+" : "") + avg.toFixed(3);

  // Update the DOM element with the calculated average deviation
  document.querySelector("#stats .avg_dev").textContent = avg;
}

// Hides all elements with the class 'hide' by adding 'hidden' class
function hide() {
  document
    .querySelectorAll(".hide")
    .forEach((element) => element.classList.add("hidden"));
}

// Initiate fireworks
function fireworks() {
  const duration = 5000; // Duration of the fireworks in milliseconds (5 seconds)
  const animationEnd = Date.now() + duration; // Timestamp for when the animation should end
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }; // Default confetti properties

  // Returns a random number within a given range
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Launches confetti at intervals
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval); // Stop the interval when the time is up
    }

    // Adjust the particle count based on the time left
    const particleCount = 50 * (timeLeft / duration);

    // Create two confetti blasts from different sides
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250); // Interval set at 250 milliseconds
}

// Popovers
function popovers() {
  // Define a mapping of class names to their respective titles and image paths
  const popoverMappings = [
    { className: "backLeft", title: "Back Left", imagePath: "back-left.png" },
    {
      className: "backCenter",
      title: "Back Center",
      imagePath: "back-center.png",
    },
    {
      className: "backRight",
      title: "Back Right",
      imagePath: "back-right.png",
    },
    {
      className: "centerLeft",
      title: "Center Left",
      imagePath: "center-left.png",
    },
    {
      className: "center_center",
      title: "Center Center",
      imagePath: "center-center.png",
    },
    {
      className: "centerRight",
      title: "Center Right",
      imagePath: "center-right.png",
    },
    {
      className: "frontLeft",
      title: "Front Left",
      imagePath: "front-left.png",
    },
    {
      className: "frontCenter",
      title: "Front Center",
      imagePath: "front-center.png",
    },
    {
      className: "frontRight",
      title: "Front Right",
      imagePath: "front-right.png",
    },
  ];

  // Iterate through each mapping and set the popover attributes
  popoverMappings.forEach((mapping) => {
    document.querySelectorAll(`.${mapping.className}`).forEach((element) => {
      element.setAttribute("title", mapping.title);
      element.setAttribute(
        "data-content",
        `<img src='../images/${mapping.imagePath}' class='img-fluid'>`
      );
    });
  });

  // Initiate popovers for elements with the data-toggle attribute set to "popover"
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-toggle="popover"]')
  );
  const popoverList = popoverTriggerList.map((popoverTriggerEl) => {
    return new bootstrap.Popover(popoverTriggerEl, {
      html: true,
      trigger: "hover",
    });
  });
}

popovers();
