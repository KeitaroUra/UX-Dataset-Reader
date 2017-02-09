// create web audio api context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

// create Oscillator and gain node
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var panner = audioCtx.createPanner();

panner.panningModel = 'equalpower';

// connect oscillator to gain node to speakers

oscillator.connect(panner);
panner.connect(gainNode);

// create initial theremin frequency and volumn values

var maxFreq = 9000;
var maxVol = 0.02;

var initialFreq = 3000;
var initialVol = 0.01;

// set options for the oscillator

oscillator.type = 'sine';
oscillator.detune.value = 100; // value in cents
oscillator.start(0);

oscillator.onended = function() {
  console.log('Your tone has now stopped playing!');
}

gainNode.gain.value = initialVol;

// test canvas

var canvas = document.querySelector('#canvas');
/*var canvas = document.createElement("canvas");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);
canvas.setAttribute("style", "position: absolute; x:0; y:0;");
document.body.appendChild(canvas);*/

//Then you can draw a point at (10,10) like this:

var context = canvas.getContext("2d");
context.strokeRect(0, 0, canvas.width, canvas.height);

var interval = 40;
var timeElapsed = 0;
var duration = 3000;

var rectsize = 8;
var rectsizehalf = rectsize / 2.0;

function updatePage() {
    KeyFlag = false;

    timeElapsed += interval;
    oscillator.frequency.value = timeElapsed / duration * maxFreq;

    var x = -1.0 + (timeElapsed / duration * 2.0);
    panner.setPosition(x, 0, 1 - Math.abs(x));
    context.clearRect(0, 0, canvas.width, canvas.height);

    var posX = timeElapsed / duration * canvas.width;
    var posY = canvas.height - (oscillator.frequency.value / maxFreq * canvas.height);

    context.fillRect(posX - rectsizehalf, posY - rectsizehalf, rectsize, rectsize);
    context.strokeRect(0, 0, canvas.width, canvas.height);
}

// launch button
var launch = document.getElementById('launch');
var intervalTimer;

stopSound = function()
{
    gainNode.disconnect(audioCtx.destination);
    launch.setAttribute('playing', 'false');
    launch.innerHTML = "Launch";
    launch.disabled = false;
    launch.checked = false;
    launch.hovered = false;
    window.clearInterval(intervalTimer);
    oscillator.frequency.value = 0;
}

launchOnClick = function() 
{
  //alert("click");
  if (launch.getAttribute('playing') === 'false')
  {
    gainNode.connect(audioCtx.destination);
    launch.setAttribute('playing', 'true');
    launch.innerHTML = "Playing";
    launch.disabled = true;
    timeElapsed = 0;
    setTimeout(stopSound, duration)
    updatePage();
    intervalTimer = setInterval(updatePage, interval);
  }
}

launch.addEventListener("click", launchOnClick)

// Radio
var radio = document.getElementById('oscillatorType')

radioOnClick = function() 
{
    for (var i = 0, length = radio.length; i < length; i++) {
        if (radio[i].checked)
        {
            // do whatever you want with the checked radio
            oscillator.type = radio[i].value;
            //alert(oscillator.type);
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

radio.onclick = radioOnClick;