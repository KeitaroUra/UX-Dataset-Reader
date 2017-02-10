var array;
var arrayNumFields;

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

var interval = 100;
var timeElapsed = 0;
var index = 0;
var maxIndex = 0;
var maxValue = 0;
var minValue = 0;
var fieldIndex = 0;
var field = '';
var paused = false;
var muted = false;
var soundPlaying = false;

var rectsize = 8;
var rectsizehalf = rectsize / 2.0;

var yFactor;
var xFactor;
var intervalTimer;

function isInt(n)
{
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n)
{
    return Number(n) === n && n % 1 !== 0;
}

function getFieldAtIndex()
{
  maxValue = 0;
  minValue = 'NA';
  field = arrayNumFields[fieldIndex];
  for (var i = 0; i < maxIndex; i++)
  {
    if (array.data[i][field] == null)
    {
      maxIndex = i;
      break;
    }
    if (maxValue < array.data[i][field])
      maxValue = array.data[i][field];
    if (minValue == 'NA' || minValue > array.data[i][field])
      minValue = array.data[i][field];
  }
  if (minValue == 'NA')
    minValue = 0;
  console.log(minValue);
}

function launchSound()
{
  if (soundPlaying == false)
  {
    soundPlaying = true;
    timeElapsed = 0;
    index = 0;
    paused = true;
    maxIndex = array.data.length - 1;
    getFieldAtIndex();

    xFactor = 0;
    yFactor = 0;
    updatePage();
    intervalTimer = setInterval(nextValue, interval);
  }
}

function nextValue()
{
  if (!paused)
  {
    if (index < maxIndex)
    {
      timeElapsed += interval;

      updateValue();

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
}

function updateValue()
{
  if (index < maxIndex)
  {
    xFactor = index / maxIndex;
    if (array.data[index][field])
    {
      yFactor = array.data[index][field] / maxValue;

      // frequency
      //oscillator.frequency.value = yFactor * maxFreq;
      oscillator.frequency.value = frequencyCalc(minValue, maxValue, array.data[index][field]);
    }

    // panning
    var x = -1.0 + (xFactor * 2.0);
    panner.setPosition(x, 0, 1 - Math.abs(x));


    updatePage();
  }
}

function updatePage()
{
    value = array.data[index][field];
    if (soundPlaying == true)
      coord.innerHTML = 'index = ' + index + '/' + maxIndex + ', field = ' + field + ' (' + fieldIndex + ')' + ", value = " + value + "/" + maxValue + " (minimum = " + minValue + ")";
    else
      coord.innerHTML = 'index = NA/' + maxIndex + ', field = ' + field + ' (' + fieldIndex + ')' + ", value = NA/" + maxValue + "(minimum = " + minValue + ")";

    // Update canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (soundPlaying == true)
    {
      var posX = xFactor * canvas.width;
      var posY = canvas.height - (yFactor * canvas.height);
      context.fillRect(posX - rectsizehalf, posY - rectsizehalf, rectsize, rectsize);
    }
    context.strokeRect(0, 0, canvas.width, canvas.height);
}

// launch button
var launch = document.getElementById('launch');
launch.disabled = true;

mute = function()
{
  gainNode.gain.value = 0;
  muted = true;
}

unmute = function()
{
  gainNode.gain.value = initialVol;
  muted = false;
}

stopSound = function()
{
  if (soundPlaying == true)
  {
    gainNode.disconnect(audioCtx.destination);
    launch.setAttribute('playing', 'false');
    launch.innerHTML = "Launch";
    launch.disabled = false;
    launch.checked = false;
    launch.hovered = false;
    soundPlaying = false;
    index = 0;
  }
}

launchOnClick = function() 
{
  if (soundPlaying == false)
  {
    gainNode.connect(audioCtx.destination);
    launch.setAttribute('playing', 'true');
//    launch.innerHTML = "Playing";
//    launch.disabled = true;

    launchSound();
  }
}

//launch.addEventListener("click", launchOnClick)

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

//radio.onclick = radioOnClick;

// coord
var coord = document.getElementById('coord');

// PARSING

function handleFileSelect(evt)
{
  var file = evt.target.files[0];

    $("#presentation").hide();
    $("#help").show();
    $("#display").show();
    $("#canvas").show();
 

  if (soundPlaying == true)
    stopSound();
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results)
    {
      array = results;
      console.log(array);
      launch.disabled = false;
      fieldIndex = 0;
      var fi = 0;
      arrayNumFields = [];
      for (var i = 0, length = array.meta.fields.length; i < length; i++)
      {
        if (isInt(array.data[0][array.meta.fields[i]]) || isFloat(array.data[0][array.meta.fields[i]]))
        {
          arrayNumFields.push(array.meta.fields[i]);
        }
      }
      console.log(arrayNumFields);
      getFieldAtIndex();
      updatePage();
      launchOnClick();
    }
  });
}

$(document).ready(function(){
  $("#csv-file").change(handleFileSelect);
  $("#getInput").on("click", function() {
    $("#csv-file").trigger("click");
  });
});


frequencyCalc = function(min, max, current)
{
    var total = max - min;
    var equivalence = total / differenceNote;
    current = (current - min);
    current = (current / equivalence) + minimumNote;
    return (440 * Math.pow(2, (current/12)));
}

var body = document.querySelector('body');

body.onkeydown = function(e) {

  // 37 is arrow left, 39 is arrow right,
  // 38 is arrow up, 40 is arrow down

  if (soundPlaying)
  {
    if (e.keyCode == 32) // space
    {
      e.preventDefault();
      paused = !paused;
      updateValue();
    };

    if (paused && e.keyCode == 37) // left
    {
      e.preventDefault();
      index = Math.max(index - 1, 0);
      updateValue();
    };

    if (paused && e.keyCode == 39) // right
    {
      e.preventDefault();
      index = Math.min(index + 1, maxIndex - 1);
      updateValue();
    };

    if (e.keyCode == 38) // up
    {
      e.preventDefault();
      fieldIndex = Math.max(fieldIndex - 1, 0);
      getFieldAtIndex();
      speak("Now going through " + field);
      updatePage();
    };

    if (e.keyCode == 40) // down
    {
      e.preventDefault();
      fieldIndex = Math.min(fieldIndex + 1, arrayNumFields.length - 1);
      getFieldAtIndex();
      speak("Now going through " + field);
      updatePage();
    };

    if (e.keyCode == 77) // m
    {
      e.preventDefault();
      if (muted)
        unmute();
      else
        mute();
    };

    if (e.keyCode == 80) // p
    {
      e.preventDefault();
      speakValue("index", index, array.data[index][field]);
        
    };
  }

}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

speak = function(text, voice) {
    text = text.replaceAll("/", "divided by");
    responsiveVoice.speak(text, voice);
}

speakValue = function(enteteX, xValue, yValue)
{
    speak(field + " has value " + yValue + " when " + enteteX + " equals " + xValue, "UK English Female");
    console.log(field + " has value " + yValue + " when " + enteteX + " equals " + xValue);
}