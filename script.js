var language = '';
var voiceLanguage = "";
var array;
var arrayNumFields;

var languageTab = {};
var tabFr = 
{
  'intro': 'Ouverture d\'un dataset de ', 
  'intro2': ' colonnes. Appuyez sur F1 pour écouter les instructions.', 
  'currentY': "L'axe des ordonnées est définie sur ", 
  'currentY2': '.', 
  'valuesRange': 'Les valeurs sont comprises entre ', 
  'valuesRange2': ' et ',
  'valuesRange3': '.', 
  'value': 'Le champ ', 
  'value2': ' a une valeur de ', 
  'value3': ' à ', 
  'value4': ' ', 
  'value5': '.', 
  'index': "l'index", 
  'shortcuts': "Raccourcis", 
  'press': "Appuyez sur ", 
};
var tabEn = 
{
  'intro': 'Dataset of ', 
  'intro2': ' rows opened. Press F1 for instructions.',
  'currentY': 'Currently reviewing ',
  'currentY2': ' on the Y axis.',
  'valuesRange': 'Values range from ', 
  'valuesRange2': ' to ', 
  'valuesRange3': '.', 
  'value': 'The field ', 
  'value2': ' has a value of ',
  'value3': ' at ',
  'value4': ' ',
  'value5': '.',
  'index': "index", 
  'shortcuts': "Shortcuts", 
  'press': "Press ", 
};

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

var volumeFactor = 1.0;
var initialVol = 0.04;

// set options for the oscillator

oscillator.type = 'sine';
oscillator.detune.value = 0; // value in cents
oscillator.start(0);

oscillator.onended = function()
{
  console.log('Your tone has now stopped playing!');
}

gainNode.gain.value = initialVol * volumeFactor;

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
var rangeValue = 0;
var fieldIndex = 0;
var field = '';
var paused = false;
var muted = false;
var soundPlaying = false;
var borderSize;
var muteUntilCommand = false;

var circleRadius = 4;

var yFactor;
var xFactor;
var intervalTimer;
function updateLanguage(sLanguage)
{
  hide = document.getElementsByClassName(language);
  for (var i = 0; i < hide.length; i++)
    hide[i].style.display = "none";
  language = sLanguage;
  if (language == 'FR')
  {
    languageTab = tabFr;
    voiceLanguage = "French Female";
  }
  else
  {
    languageTab = tabEn;
    voiceLanguage = "UK English Female";
  }
  show = document.getElementsByClassName(language);
  for (var i = 0; i < show.length; i++)
    show[i].style.display = "inline";
}

var languageSelector = document.getElementById('languageSelector')
languageSelector.onchange = function()
{
  updateLanguage(languageSelector.options[languageSelector.selectedIndex].value);
}



function isInt(n)
{
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n)
{
    return Number(n) === n && n % 1 !== 0;
}

function isIntOrFloat(n)
{
    return isInt(n) || isFloat(n);
}

function getArrayProperties()
{
  maxValue = 0;
  minValue = 'NA';
  maxIndex = array.data.length - 2;
  field = arrayNumFields[fieldIndex];
  for (var i = 0; i < array.data.length; i++)
  {
    if (isIntOrFloat(array.data[i][field]))
    {
      /*if (array.data[i] == null || array.data[i][field] == null) // last field is invalid
      {
        maxIndex = i - 1;
        break;
      }*/
      if (maxValue < array.data[i][field])
        maxValue = array.data[i][field];
      if (minValue == 'NA' || minValue > array.data[i][field])
        minValue = array.data[i][field];
    }
  }
  if (minValue == 'NA')
    minValue = 0;
  rangeValue = maxValue - minValue;
  console.log(maxIndex);
}

function launchSound()
{
  if (soundPlaying == false)
  {
    soundPlaying = true;
    gainNode.connect(audioCtx.destination);
    timeElapsed = 0;
    index = 0;
    paused = true;
    getArrayProperties();

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
    if (index <= maxIndex)
    {
      timeElapsed += interval;

      updateValue();

      index++;
    }
    else
    {
      // Stop timer
      paused = true;
      muteUntilCommand = true;
      mute();
      index = maxIndex;
      updatePage();
      return false;
    }
  }
}

function updateValue()
{
  if (index <= maxIndex)
  {
    xFactor = index / maxIndex;
    value = array.data[index][field] || 0;
    yFactor = (value - minValue) / rangeValue;

    // frequency
    //oscillator.frequency.value = yFactor * maxFreq;
    if (maxValue - minValue != 0)
      oscillator.frequency.value = frequencyCalc(minValue, maxValue, value);
    else
    {
      oscillator.frequency.value = 0;
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
      var xPosArray = [];
      var yPosArray = [];
      var xPosPrev;
      var yPosPrev;
      var xPos;
      var yPos;
      // Draw lines
      context.fillStyle = "black";
      context.beginPath();
      for (var i = 0; i <= maxIndex; i++)
      {
        if (array.data[i] != null)
        {
          xPos = (i) / maxIndex * canvas.width;
          yPos = canvas.height - ((array.data[i][field] - minValue) / rangeValue * canvas.height);
          xPosArray[i] = xPos;
          yPosArray[i] = yPos;
          if (i > 0)
          {
            context.lineTo(xPos, yPos);
          }
          else
            context.moveTo(xPos, yPos); // start point
          xPosPrev = xPos;
          yPosPrev = yPos;
        }
      }
      context.stroke();
      context.closePath();
      // Draw points
      context.fillStyle = "blue";
      for (var i = 0; i < maxIndex; i++)
      {
        if (array.data[i] != null)
        {
          xPos = (i) / maxIndex * canvas.width;
          yPos = canvas.height - ((array.data[i][field] - minValue) / rangeValue * canvas.height);
          context.beginPath();
          context.arc(xPos, yPos, 3, 0, 2*Math.PI);
          context.fill();
          context.closePath();
        }
      }
      // Draw current pos
      var posX = xFactor * canvas.width;
      var posY = canvas.height - (yFactor * canvas.height);
      context.beginPath();
      context.fillStyle = "red";
      context.arc(posX, posY, circleRadius, 0, 2*Math.PI);
      context.fill();
      context.closePath();
    }
}

mute = function()
{
  gainNode.gain.value = 0;
  muted = true;
}

unmute = function()
{
  gainNode.gain.value = initialVol * volumeFactor;
  muted = false;
}

updateVolume = function()
{
  if (!muted)
    gainNode.gain.value = initialVol * volumeFactor;
}

// launch button
//var launch = document.getElementById('launch');
//launch.disabled = true;

stopSound = function()
{
  if (soundPlaying == true)
  {
    gainNode.disconnect(audioCtx.destination);
    /*launch.setAttribute('playing', 'false');
    launch.innerHTML = "Launch";
    launch.disabled = false;
    launch.checked = false;
    launch.hovered = false;*/
    soundPlaying = false;
    index = 0;
  }
}

/*launchOnClick = function() 
{
  if (soundPlaying == false)
  {
    launch.setAttribute('playing', 'true');
    launch.innerHTML = "Playing";
    launch.disabled = true;

    launchSound();
    updateValue();
  }
}

launch.addEventListener("click", launchOnClick)*/

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

  if (file != null)
  {
    if (soundPlaying == true)
      stopSound();
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results)
      {
        array = results;
        console.log(array);
        //launch.disabled = false;
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
        getArrayProperties();
        launchSound();
        updateValue();
        updateFieldList(arrayNumFields);
        speak(languageTab['intro'] + maxIndex + languageTab['intro2'] + " " + languageTab['currentY'] + field + languageTab['currentY2']);
      }
    });
  }
}

updateFieldList = function(arrayNumFields)
{
  document.getElementById('fields').innerHTML="<h2>Fields</h2>";
  var ul = document.getElementById('fields');

  for (var i = 0, length = arrayNumFields.length; i < length; i++)
  {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(arrayNumFields[i]));
    ul.appendChild(li);  
  }
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

var body = document.querySelector('body');

unmuteWithCommand = function()
{
  if (muteUntilCommand)
  {
    muteUntilCommand = false;
    unmute();
  }
}

body.onkeydown = function(e) {

  // 37 is arrow left, 39 is arrow right,
  // 38 is arrow up, 40 is arrow down

  if (soundPlaying)
  {
    if (e.keyCode == 32) // space
    {
      unmuteWithCommand();
      e.preventDefault();
      paused = !paused;
      updateValue();
    }

    if (paused && e.keyCode == 37) // left
    {
      unmuteWithCommand();
      e.preventDefault();
      index = Math.max(index - 1, 0);
      updateValue();
    }

    if (e.keyCode == 8) // Backspace
    {
      unmuteWithCommand();
      e.preventDefault();
      index = 0;
      paused = true;
      updateValue();
    }

    if (e.keyCode == 27) // Escape
    {
      voiceEndCallback();
      unmuteWithCommand();
      responsiveVoice.cancel();
    }

    if (paused && e.keyCode == 39) // right
    {
      unmuteWithCommand();
      e.preventDefault();
      index = Math.min(index + 1, maxIndex);
      updateValue();
    }

    if (e.keyCode == 38) // up
    {
      unmuteWithCommand();
      e.preventDefault();
      if (fieldIndex > 0)
      {
        fieldIndex = fieldIndex - 1;
        getArrayProperties();
        speak(languageTab['currentY'] + field + languageTab['currentY2']);
        updateValue();
      }
    }

    if (e.keyCode == 40) // down
    {
      unmuteWithCommand();
      e.preventDefault();
      if (fieldIndex < arrayNumFields.length - 1)
      {
        fieldIndex = fieldIndex + 1;
        getArrayProperties();
        speak(languageTab['currentY'] + field + languageTab['currentY2']);
        updateValue();
      }
    }

    if (e.keyCode == 73) // i
    {
      e.preventDefault();
      speak(languageTab['valuesRange'] + minValue + languageTab['valuesRange2'] + maxValue + languageTab['valuesRange3']);
    }

    if (e.keyCode == 77) // m
    {
      e.preventDefault();
      if (muted)
        unmute();
      else
        mute();
      unmuteWithCommand();
    }

    if (e.keyCode == 80) // p
    {
      unmuteWithCommand();
      e.preventDefault();
      speakValue(languageTab['index'], index, array.data[index][field]);
        
    }

    if (e.keyCode == 112) // F1
    {
      e.preventDefault();
      str = languageTab['shortcuts'] + " : ";
      var ul = document.getElementById('shortcutsList' + language);
      var list = ul.getElementsByTagName("li");

      for (var i = 0, length = list.length; i < length; i++)
      {
        str = str + languageTab['press'] + list[i].innerHTML + ". ";
      }
      speak(str);
    }
  }

  if (e.keyCode == 76) // l
  {
    if (language == 'FR')
     updateLanguage('EN');
   else
     updateLanguage('FR');
  }

}

function voiceStartCallback()
{
  volumeFactor = 0;
  updateVolume();
}

function voiceEndCallback()
{
  volumeFactor = 1.0;
  updateVolume();
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

speak = function(text, voice) {
    text = text.replaceAll("/", "divided by");
    var parameters = {
      onstart : voiceStartCallback,
      onend : voiceEndCallback,
      rate : 1
    }
    responsiveVoice.speak(text, voiceLanguage, parameters);
}

speakValue = function(enteteX, xValue, yValue)
{
    speak(languageTab['value'] + field + languageTab['value2'] + yValue + languageTab['value3'] + enteteX + languageTab['value4'] + xValue + languageTab['value5'], voiceLanguage);
    //console.log(field + " has value " + yValue + " at " + enteteX + " equals " + xValue);
}

// ON LOAD

function OnLoadPage()
{
  updateLanguage('FR');
}

window.onload = OnLoadPage();
