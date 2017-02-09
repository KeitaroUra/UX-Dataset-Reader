var array;

// Sound API

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

var maxFreq = 7000;
var maxVol = 0.02;

var initialVol = 0.02;

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

var interval = 140;
var timeElapsed = 0;
var index = 0;
var MaxIndex = 0;
var maxValue = 0;
var field = 'Distance (km)';

var rectsize = 8;
var rectsizehalf = rectsize / 2.0;

var yFactor;
var xFactor;
var intervalTimer;

function launchSound()
{
  timeElapsed = 0;
  index = 0;
  MaxIndex = array.data.length;
  maxValue = 0;
  for (var i = 0; i < MaxIndex; i++)
  {
    if (maxValue < array.data[i][field])
      maxValue = array.data[i][field];
  }

  xFactor = 0;
  yFactor = 0;
  updatePage();
  intervalTimer = setInterval(nextValue, interval);
}

function nextValue()
{
  if (index < MaxIndex && array.data[index][field])
  {
    timeElapsed += interval;

    yFactor = array.data[index][field] / maxValue;
    xFactor = index / MaxIndex;
    
    // frequency
    oscillator.frequency.value = yFactor * maxFreq;

    // panning
    var x = -1.0 + (xFactor * 2.0);
    panner.setPosition(x, 0, 1 - Math.abs(x));

    updatePage();

    index++;
  }
  else
  {
    // Stop timer
    window.clearInterval(intervalTimer);
    stopSound();
    updatePage();
    return false;
  }
}

function updatePage()
{
    // Update canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    var posX = xFactor * canvas.width;
    var posY = canvas.height - (yFactor * canvas.height);
    context.fillRect(posX - rectsizehalf, posY - rectsizehalf, rectsize, rectsize);
    context.strokeRect(0, 0, canvas.width, canvas.height);
}

// launch button
var launch = document.getElementById('launch');
launch.disabled = true;

stopSound = function()
{
  gainNode.disconnect(audioCtx.destination);
  launch.setAttribute('playing', 'false');
  launch.innerHTML = "Launch";
  launch.disabled = false;
  launch.checked = false;
  launch.hovered = false;

}

launchOnClick = function() 
{
  if (launch.getAttribute('playing') === 'false')
  {
    gainNode.connect(audioCtx.destination);
    launch.setAttribute('playing', 'true');
    launch.innerHTML = "Playing";
    launch.disabled = true;

    launchSound();
  }
}

launch.addEventListener("click", launchOnClick)

// Radio
var radio = document.getElementById('oscillatorType')

radioOnClick = function() 
{
  for (var i = 0, length = radio.length; i < length; i++)
  {
    if (radio[i].checked)
    {
      oscillator.type = radio[i].value;
            // only one radio can be logically checked, don't check the rest
            break;
    }
  }
}

radio.onclick = radioOnClick;

// PARSING

function handleFileSelect(evt)
{
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results)
    {
      array = results;
      console.log(array);
      launch.disabled = false;
    }
  });
}

$(document).ready(function(){
  $("#csv-file").change(handleFileSelect);
});


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


