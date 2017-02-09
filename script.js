// create web audio api context
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

// create Oscillator and gain node
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

// connect oscillator to gain node to speakers

oscillator.connect(gainNode);
//gainNode.connect(audioCtx.destination);

// create initial theremin frequency and volumn values

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var maxFreq = 6000;
var maxVol = 0.02;

var initialFreq = 3000;
var initialVol = 0.001;

// set options for the oscillator

oscillator.type = 'sine';
oscillator.detune.value = 100; // value in cents
oscillator.start(0);

oscillator.onended = function() {
  console.log('Your tone has now stopped playing!');
}

gainNode.gain.value = initialVol;

// Mouse pointer coordinates

var CurX;
var CurY;

// Get new mouse pointer coordinates when mouse is moved
// then set new gain and pitch values

document.onmousemove = updatePage;

interval = 40;
//setInterval(updatePage, interval);
timeElapsed = 0;
duration = 3000;

function updatePage() {
    KeyFlag = false;

    timeElapsed += interval;
    oscillator.frequency.value = timeElapsed / duration * maxFreq;
    //gainNode.gain.value = (CurY/HEIGHT) * maxVol;

}

// launch button

stopSound = function()
{
    gainNode.disconnect(audioCtx.destination);
    launch.setAttribute('playing', 'false');
    launch.innerHTML = "Launch";
}

launchOnClick = function() 
{
  alert("click");
  if (launch.getAttribute('playing') === 'false')
  {
    gainNode.connect(audioCtx.destination);
    launch.setAttribute('playing', 'true');
    launch.innerHTML = "Playing";
    setTimeout(stopSound, duration)
  }
}

var launch = document.getElementById('launch');
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
            alert(oscillator.type);
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }
}

radio.onclick = radioOnClick;
