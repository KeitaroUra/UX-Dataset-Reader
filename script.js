// create web audio api context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

// create Oscillator and gain node
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
var panner = audioCtx.createPanner();

panner.panningModel = 'equalpower';

var minimumNote = -21;
var maximumNote = 27;
var differenceNote = maximumNote - minimumNote;

// connect oscillator to gain node to speakers

oscillator.connect(panner);
panner.connect(gainNode);

// create initial theremin frequency and volumn values

var maxFreq = 6000;
var maxVol = 0.02;

var initialVol = 0.01;

// set options for the oscillator

oscillator.type = 'sine';
oscillator.detune.value = 100; // value in cents
oscillator.start(0);

oscillator.onended = function()
{
  console.log('Your tone has now stopped playing!');
}

gainNode.gain.value = initialVol;

// test canvas

var canvas = document.querySelector('#canvas');
var context = canvas.getContext("2d");
context.strokeRect(0, 0, canvas.width, canvas.height);

var interval = 20;
var timeElapsed = 0;
var duration = 3000;

var rectsize = 8;
var rectsizehalf = rectsize / 2.0;

function updatePage()
{
    timeElapsed += interval;
    oscillator.frequency.value = timeElapsed / duration * maxFreq;
    // frequency
    oscillator.frequency.value = Math.sin(timeElapsed / duration * Math.PI) * maxFreq;

    // panning
    var x = -1.0 + (timeElapsed / duration * 2.0);
    panner.setPosition(x, 0, 1 - Math.abs(x));


    // Update canvas
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
    // Stop timer
    window.clearInterval(intervalTimer);
    updatePage();
}

launchOnClick = function() 
{
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
            oscillator.type = radio[i].value;
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

radio.onclick = radioOnClick;

frequencyCalc = function(min, max, current)
{
    var total = max - min;
    var equivalence = total / differenceNote;
    current = (current - min);
    current = (current / equivalence) + minimumNote;
    return (440 * Math.pow(2, (current/12)));
}

//var wind = document.getElementById('test');
//wind.onclick = frequencyCalc(0, 1000, 0);

