// veci pre graficke rozhranie
const canvas = document.querySelector(".visualizer");
const canvasCtx = canvas.getContext("2d");

const intendedWidth = document.querySelector(".wrapper").clientWidth;
canvas.setAttribute("width", intendedWidth);
const visualSelect = document.getElementById("visual");
let drawVisual;
let sourceNode;
// veci pre graficke rozhranie

// objekt typu AudioContext nam umoznuje vyuzivat Web Audio API
const audioContext = new AudioContext();
// objekt typu AnalyserNode nam umoznuje vyuzivat extrahovat data zo zdroja zvuku
const audioAnalyser = new AnalyserNode(audioContext, {
  fftSize: 2048,
  maxDecibels: -10,
  minDecibels: -90,
  smoothingTimeConstant: 0.85,
});

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => processStream(stream));

function processStream(stream) {
  // objekt typu MediaStreamAudioSourceNode je zvuk k realnom case, s ktorym viem manipulovat
  sourceNode = audioContext.createMediaStreamSource(stream);
  // napojim analyzer na vstup audia
  sourceNode.connect(audioAnalyser);
  visualize();
}

function visualize() {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  const visualSetting = visualSelect.value;
  console.log(visualSetting);

  if (visualSetting === "sinewave") {
    //audioAnalyser.fftSize = 128;
    const bufferLength = audioAnalyser.fftSize;
    console.log(bufferLength);
    const dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const draw = function () {
      //drawVisual = requestAnimationFrame(draw);
      drawVisual = setTimeout(draw, 10000);
      audioAnalyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgb(200, 200, 200)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";
      console.log(dataArray);
      canvasCtx.beginPath();

      const sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = (v * HEIGHT) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  } else if (visualSetting == "frequencybars") {
    //audioAnalyser.fftSize = 4096;

    // pocet harmonickych (audioAnalyser.fftsize/2)
    const bufferLengthAlt = audioAnalyser.frequencyBinCount;
    console.log(bufferLengthAlt);

    // kopirovanie hodnot z analyzeru do arrayu 8 bitovych unsigned integerov, ktoreho velkost je pocet harmonickych
    const dataArrayAlt = new Uint8Array(bufferLengthAlt);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    const drawAlt = function () {
      drawVisual = requestAnimationFrame(drawAlt);

      audioAnalyser.getByteFrequencyData(dataArrayAlt);

      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLengthAlt; i++) {
        barHeight = dataArrayAlt[i];

        canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    };

    drawAlt();
  } else if (visualSetting == "off") {
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = "red";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

visualSelect.onchange = function () {
  window.cancelAnimationFrame(drawVisual);
  visualize();
};
