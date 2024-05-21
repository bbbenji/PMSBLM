(() => {
  // Constants for screw pitch and rotation directions
  const screwPitch = 0.5;
  const cw =
    'CW&nbsp;&nbsp;<span class="mdi mdi-rotate-right text-danger"></span>';
  const ccw = 'CCW <span class="mdi mdi-rotate-left text-primary"></span>';

  // DOM elements
  const source = document.getElementById("source");
  const target = document.getElementById("target");
  const action = document.getElementById("action");
  const save = document.getElementById("save");
  let modified = false;

  // Google Sheets script URL
  const scriptURL =
    "https://script.google.com/macros/s/AKfycby6ONP6GHYL6qrMmfkgeyZh7nNGeQIYSL6EKwOFH28NeYerwWnuWwhpkJu4MspuQ7aS2Q/exec";

  // Debounced input event listener to track changes
  source.addEventListener(
    "input",
    debounce(() => {
      modified = true;
    }, 300)
  );

  // Debounce function to limit the rate at which a function can fire
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Function to send data to Google Sheets
  async function send2GS(raw) {
    if (save.checked && modified) {
      const formData = new FormData();
      formData.append(
        "input",
        JSON.stringify(raw)
          .replace(/\n/g, " ")
          .replace(/ {2,}/g, " ")
          .replace(/\], \[/g, "],\n[")
          .replace(/\[ \[/g, "[")
          .replace(/\] \]/g, "]")
      );

      try {
        const response = await fetch(scriptURL, {
          method: "POST",
          body: formData,
        });
        console.log("Success!", response);
      } catch (error) {
        console.error("Error!", error.message);
      }
      modified = false;
    }
  }

  // Event listener for the 'action' button click
  action.addEventListener("click", () => {
    // Clean and process the raw data
    const raw = clean();
    const rawFlat = raw.flat().map(Number);

    // Perform various data conversions and calculations
    convert(raw);
    minMax(rawFlat);
    maxDiff(rawFlat);
    avgDev(rawFlat);

    // Plot the processed data
    plot(raw);

    // Send to Google Sheets
    send2GS(raw);
  });

  // Function to clean and process raw string data from a source input
  function clean() {
    let raw = source.value
      .replace(/\w+:\s*/g, "") // Remove prefixes like 'Recv: '
      .replace(/\|/g, "") // Remove '|'
      .replace(/^[ \t]*\r?\n/gm, "") // Remove blank lines
      .trim()
      .split("\n"); // Split into lines

    // Remove trailing and leading column numbers
    if (raw[raw.length - 1].trim().match(/^0\s+[\s\d]+\d$/)) raw.pop();
    if (raw[0].trim().match(/^0\s+[\s\d]+\d$/)) raw.shift();

    raw = raw.map((line, index) => {
      const processedLine = line
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

  // Function to plot data using Plotly
  function plot(raw) {
    const flipOutput = document.getElementById("flipOutput");
    if (flipOutput.checked) raw.reverse();

    hide();
    const data = [{ z: raw, type: "surface" }];
    const layout = {
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        zaxis: { autorange: false, range: [-1, 1] },
        camera: { eye: { x: 0, y: -2.5, z: 1 }, up: { x: 0, y: 0, z: 1 } },
      },
    };
    Plotly.newPlot(target, data, layout, { responsive: true });
  }

  // Function to convert raw data and update the UI
  function convert(raw) {
    const midRow = arrayMid(raw);
    const {
      midRowValueAvg,
      midRowFirstValueAvg,
      midRowLastValueAvg,
      firstRowMidValueAvg,
      lastRowMidValueAvg,
    } = calculateAverages(raw, midRow);

    const center = midRowValueAvg;
    const positions = calculatePositions(raw, center, {
      midRowFirstValueAvg,
      midRowLastValueAvg,
      firstRowMidValueAvg,
      lastRowMidValueAvg,
    });

    // Update DOM elements with calculated values
    positions.forEach(({ position, selector }) => {
      document.querySelector(`#raw .${selector}`).innerHTML =
        relative(position);
      document.querySelector(`#degrees .${selector}`).innerHTML =
        degrees(position);
      document.querySelector(`#fractions .${selector}`).innerHTML =
        fractions(position);
    });
  }

  // Function to calculate averages of specific positions in the data
  function calculateAverages(raw, midRow) {
    let midRowValueAvg,
      midRowFirstValueAvg,
      midRowLastValueAvg,
      firstRowMidValueAvg,
      lastRowMidValueAvg;

    if (raw.length % 2 === 0) {
      // Calculate averages for even number of rows
      const midRowValue = [...arrayMid(midRow[0]), ...arrayMid(midRow[1])];
      midRowValueAvg = arraySum(midRowValue) / midRowValue.length;
      midRowFirstValueAvg = arraySum([midRow[0][0], midRow[1][0]]) / 2;
      midRowLastValueAvg =
        arraySum([
          midRow[0][midRow[0].length - 1],
          midRow[1][midRow[1].length - 1],
        ]) / 2;
      firstRowMidValueAvg = arraySum(arrayMid(raw[0])) / 2;
      lastRowMidValueAvg = arraySum(arrayMid(raw[raw.length - 1])) / 2;
    } else {
      // Calculate averages for odd number of rows
      midRowValueAvg = arrayMid(midRow[0])[0];
      midRowFirstValueAvg = midRow[0][0];
      midRowLastValueAvg = midRow[0][midRow[0].length - 1];
      firstRowMidValueAvg = arrayMid(raw[0])[0];
      lastRowMidValueAvg = arrayMid(raw[raw.length - 1])[0];
    }

    return {
      midRowValueAvg,
      midRowFirstValueAvg,
      midRowLastValueAvg,
      firstRowMidValueAvg,
      lastRowMidValueAvg,
    };
  }

  // Function to calculate relative positions and their selectors
  function calculatePositions(raw, center, averages) {
    const {
      midRowFirstValueAvg,
      midRowLastValueAvg,
      firstRowMidValueAvg,
      lastRowMidValueAvg,
    } = averages;
    const backLeft = raw[0][0] - center;
    const backCenter = firstRowMidValueAvg - center;
    const backRight = raw[0][raw.length - 1] - center;
    const centerLeft = midRowFirstValueAvg - center;
    const centerRight = midRowLastValueAvg - center;
    const frontLeft = raw[raw.length - 1][0] - center;
    const frontCenter = lastRowMidValueAvg - center;
    const frontRight = raw[raw.length - 1][raw.length - 1] - center;

    return [
      { position: backLeft, selector: "backLeft" },
      { position: backCenter, selector: "backCenter" },
      { position: backRight, selector: "backRight" },
      { position: centerLeft, selector: "centerLeft" },
      { position: centerRight, selector: "centerRight" },
      { position: frontLeft, selector: "frontLeft" },
      { position: frontCenter, selector: "frontCenter" },
      { position: frontRight, selector: "frontRight" },
    ];
  }

  // Function to sum values in an array
  function arraySum(array) {
    return array
      .flat(Infinity)
      .map(Number)
      .reduce((acc, curr) => acc + curr, 0);
  }

  // Function to find the middle element(s) of an array
  function arrayMid(raw, ind = 0) {
    if (raw[ind] === undefined) {
      return ind % 2 !== 0
        ? [raw[(ind - 1) / 2]]
        : [raw[ind / 2 - 1], raw[ind / 2]];
    }
    return arrayMid(raw, ++ind);
  }

  // Function to format relative position values for display
  function relative(position) {
    const pos = position.toFixed(2);
    return pos === "0.00"
      ? '±0.00 mm <span class="mdi mdi-check text-success"></span>'
      : `${
          pos >= 0 ? "+" : ""
        }${pos} mm <span class="mdi mdi-close text-danger"></span>`;
  }

  // Function to convert position to degrees and format for display
  function degrees(position) {
    const deg = Math.round((position / screwPitch) * 360);
    return deg === 0
      ? '0° <span class="mdi mdi-check text-success"></span>'
      : `${Math.abs(deg)}° ${deg > 0 ? cw : ccw}`;
  }

  // Function to convert position to fractional representation and format for display
  function fractions(position) {
    const gcd = (a, b) => (b < 0.0000001 ? a : gcd(b, Math.floor(a % b)));
    const abs = Math.abs(position / screwPitch).toFixed(1);
    const len = abs.toString().length - 2;
    let denominator = Math.pow(10, len);
    let numerator = abs * denominator;
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    const fraction = `${Math.floor(numerator)}/${Math.floor(denominator)}`;

    return fraction === "0/1"
      ? '0 <span class="mdi mdi-check text-success"></span>'
      : `${fraction} ${position > 0 ? cw : ccw}`;
  }

  // Function to update minimum and maximum values in the DOM
  function minMax(rawFlat) {
    const min = (Math.min(...rawFlat) >= 0 ? "+" : "") + Math.min(...rawFlat);
    const max = (Math.max(...rawFlat) >= 0 ? "+" : "") + Math.max(...rawFlat);
    document.querySelector("#stats .min").textContent = min;
    document.querySelector("#stats .max").textContent = max;
  }

  // Function to update maximum difference and trigger fireworks if condition is met
  function maxDiff(rawFlat) {
    const diff = Math.max(...rawFlat) - Math.min(...rawFlat);
    document.querySelector("#stats .max_diff").textContent = diff.toFixed(3);
    if (diff <= 0.02) fireworks();
  }

  // Function to update average deviation in the DOM
  function avgDev(rawFlat) {
    const avg = (rawFlat.reduce((a, b) => a + b, 0) / rawFlat.length).toFixed(
      3
    );
    document.querySelector("#stats .avg_dev").textContent =
      (avg >= 0 ? "+" : "") + avg;
  }

  // Function to hide elements with the class 'hide'
  function hide() {
    document
      .querySelectorAll(".hide")
      .forEach((element) => element.classList.add("hidden"));
  }

  // Function to initiate fireworks animation
  function fireworks() {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
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
    }, 250);
  }

  // Function to generate a random number within a given range
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Function to initialize popovers
  function popovers() {
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

    popoverMappings.forEach((mapping) => {
      document.querySelectorAll(`.${mapping.className}`).forEach((element) => {
        element.setAttribute("title", mapping.title);
        element.setAttribute(
          "data-content",
          `<img src='../images/${mapping.imagePath}' class='img-fluid'>`
        );
      });
    });

    const popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-toggle="popover"]')
    );
    popoverTriggerList.map(
      (popoverTriggerEl) =>
        new bootstrap.Popover(popoverTriggerEl, {
          html: true,
          trigger: "hover",
        })
    );
  }

  // Initialize popovers
  popovers();
})();
