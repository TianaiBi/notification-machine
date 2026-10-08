// The machine starts with a notification waiting to be opened.
let state = "notification";
let elapsed = 0;

// Times are in milliseconds.
let retrievalTime = 4200;
let pauseTime = 850;
let inkColor = "#242521";
let paperColor = "#f4f3ec";

// Find the parts of the HTML that will change.
let messageTitle = document.getElementById("message-title");
let messageDetail = document.getElementById("message-detail");
let actionButton = document.getElementById("action");
let progressPanel = document.getElementById("progress-panel");
let progressBar = document.getElementById("progress");
let progressFill = document.getElementById("progress-fill");
let percentLabel = document.getElementById("percent");
let dateLabel = document.getElementById("date");
let clockLabel = document.getElementById("clock");
let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// The clock uses the date, time, and timezone on the viewer's computer.
updateClock();
setInterval(updateClock, 1000);

function updateClock() {
  let now = new Date();
  let year = now.getFullYear();
  let month = String(now.getMonth() + 1).padStart(2, "0");
  let day = String(now.getDate()).padStart(2, "0");
  let hours = String(now.getHours()).padStart(2, "0");
  let minutes = String(now.getMinutes()).padStart(2, "0");
  let seconds = String(now.getSeconds()).padStart(2, "0");

  dateLabel.textContent = year + "." + month + "." + day;
  dateLabel.dateTime = year + "-" + month + "-" + day;
  clockLabel.textContent = hours + ":" + minutes + ":" + seconds;
  clockLabel.dateTime = hours + ":" + minutes + ":" + seconds;
}

// If the online library cannot load, explain it inside the window.
if (typeof window.p5 === "undefined") {
  messageTitle.textContent = "UNABLE TO START";
  messageDetail.textContent = "Connect to the internet and reload to load p5.js.";
  actionButton.disabled = true;
}

function setup() {
  let canvas = createCanvas(80, 80);
  canvas.parent("signal");
  canvas.attribute("aria-hidden", "true");

  pixelDensity(1);
  noSmooth();
  frameRate(30);

  actionButton.addEventListener("click", handleButtonClick);
  showNotification();
}

function handleButtonClick() {
  if (state === "notification") {
    startRetrieving();
  } else if (state === "result") {
    showNotification();
    actionButton.focus();
  }
}

function showNotification() {
  state = "notification";
  elapsed = 0;

  messageTitle.textContent = "1 NEW NOTIFICATION";
  messageDetail.textContent = "A message is waiting to be opened.";

  progressPanel.hidden = true;
  actionButton.textContent = "OPEN";
  actionButton.disabled = false;
  updateProgress(0);
}

function startRetrieving() {
  state = "retrieving";
  elapsed = 0;

  messageTitle.textContent = "RETRIEVING MESSAGE...";
  messageDetail.textContent = "Please wait. This could be important.";

  progressPanel.hidden = false;
  actionButton.textContent = "WAIT";
  actionButton.disabled = true;
  updateProgress(0);
}

function showResult() {
  state = "result";
  elapsed = 0;

  messageTitle.textContent = "NOTHING HAPPENED.";
  messageDetail.textContent = "You may now carry on.";

  progressPanel.hidden = true;
  actionButton.textContent = "OK";
  actionButton.disabled = false;
  actionButton.focus();
}

function updateProgress(amount) {
  progressFill.style.width = amount + "%";
  percentLabel.textContent = amount + "%";
  progressBar.setAttribute("aria-valuenow", amount);
}

function draw() {
  // Pause the timer when the browser tab is hidden.
  if (document.hidden === false) {
    elapsed = elapsed + Math.min(deltaTime, 100);
  }

  if (state === "retrieving") {
    let fraction = elapsed / retrievalTime;
    fraction = Math.min(fraction, 1);

    // The progress bar speeds up and slows down a little.
    let amount;

    if (fraction < 0.35) {
      amount = (fraction / 0.35) * 45;
    } else if (fraction < 0.8) {
      amount = 45 + ((fraction - 0.35) / 0.45) * 35;
    } else {
      amount = 80 + ((fraction - 0.8) / 0.2) * 20;
    }

    updateProgress(Math.floor(amount));

    if (fraction >= 1) {
      updateProgress(100);
      state = "pause";
      elapsed = 0;
    }
  } else if (state === "pause") {
    // Keep 100% on screen briefly before showing the message.
    if (elapsed >= pauseTime) {
      showResult();
    }
  }

  drawIcon();
}

function drawIcon() {
  clear();
  stroke(inkColor);
  strokeWeight(2);
  strokeCap(SQUARE);
  strokeJoin(MITER);
  fill(paperColor);

  if (state === "notification") {
    drawEnvelope();
  } else if (state === "retrieving" || state === "pause") {
    drawHourglass();
  } else if (state === "result") {
    drawComputer();
  }
}

function drawEnvelope() {
  rect(14, 24, 50, 34);
  line(15, 25, 39, 43);
  line(39, 43, 63, 25);
  line(15, 57, 31, 40);
  line(63, 57, 47, 40);

  // Notification badge.
  noStroke();
  fill(inkColor);
  rect(56, 13, 16, 20);
  rect(54, 15, 20, 16);

  fill(paperColor);
  rect(63, 17, 2, 7);
  rect(63, 27, 2, 2);
}

function drawHourglass() {
  line(26, 16, 54, 16);
  line(26, 64, 54, 64);

  beginShape();
  vertex(29, 18);
  vertex(29, 27);
  vertex(39, 39);
  vertex(29, 53);
  vertex(29, 62);
  vertex(51, 62);
  vertex(51, 53);
  vertex(41, 39);
  vertex(51, 27);
  vertex(51, 18);
  endShape(CLOSE);

  noStroke();
  fill(inkColor);

  let sandPosition = 4;

  if (reducedMotion.matches === false) {
    sandPosition = Math.floor(elapsed / 220) % 4;
  }

  rect(33, 24, 14, 3);
  rect(35, 27, 10, 3);
  rect(39, 39 + sandPosition * 3, 2, 3);
  rect(33, 57, 14, 3);
  rect(36, 54, 8, 3);
}

function drawComputer() {
  rect(19, 12, 42, 48);
  rect(24, 17, 32, 27);
  rect(30, 60, 20, 5);
  rect(24, 65, 32, 3);
  line(44, 52, 54, 52);

  // An unimpressed face.
  noStroke();
  fill(inkColor);
  rect(31, 26, 2, 3);
  rect(47, 26, 2, 3);
  rect(35, 36, 10, 2);
}
