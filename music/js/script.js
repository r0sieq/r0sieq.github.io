// SETUP
import {createFileStream, readFile, removeFileStream, SONGLIST_CLASS} from "./fileStream.js";
const dataPath = '../text.txt';
createFileStream(dataPath);
const PREV_BUTTON =                 document.getElementById('button-prev');
const PAUSE_BUTTON =                document.getElementById('button-pauseplay');
const NEXT_BUTTON =                 document.getElementById('button-next');
const VOLUME_BUTTON =               document.getElementById('button-volume');
const VOLUME_ADJ =                  document.getElementById('volume-adj');
const VOLUME_ALL = [
                                    document.getElementById('volume-adj'),
                                    document.getElementById('volume-adj-holder'),
                                    document.getElementById('volume-adj-zip')
                    ];
const VOLUME_ADJ_ZIP =              document.getElementById('volume-adj-zip');
const VOLUME_ADJ_HOLDER =           document.getElementById('volume-adj-holder');
const LOOP_BUTTON =                 document.getElementById('button-loop');
const AUDIO =                       document.getElementById('audio-element');
const AUDIO_TITLE =                 document.getElementById('song-title');
const AUDIO_DURATION =              document.getElementById('song-duration');
const AUDIO_PROGRESS =              document.getElementById('song-progress');
const AUDIO_PROGRESSBAR =           document.getElementById('song-progress-bar');
const AUDIO_PROGRESSBAR_HOLDER =    document.getElementById('song-progress-bar-holder');
const CARD = document.getElementById('card');


//PLAYLIST GENERATION
var songList = new Array;
document.getElementById(dataPath).addEventListener('load', () => {
    const input = readFile(dataPath).replaceAll('\n', '');
    const inputLine = input.split(';');
    inputLine.forEach(e => {
        songList[inputLine.indexOf(e)] = {};
        const inputCol = e.split('>');
        inputCol.forEach(f => {
            songList[inputLine.indexOf(e)][SONGLIST_CLASS[inputCol.indexOf(f)]] = f;
        });
    });
    console.log(songList)
    setup();
    main();
    removeFileStream(dataPath);
});

function setup(){
    AUDIO.volume = 0.5;
    AUDIO.src = songList[0].src;
    CARD.style.backgroundImage = `url(${songList[0].srcImage})`;
    AUDIO_TITLE.textContent = `${songList[0].author} — ${songList[0].title}`;
} //setup() end

function main(){
//MAIN SETUP
    let currentSong = 0;
    let volume = 0.5;
    setVolume(volume);
    let isPlaying = false;
    let isMuted = false;
    let isLooped = false;
//PREVIOUS BUTTON
    PREV_BUTTON.addEventListener('click', e => { songPrev() });
    function songPrev(){
        CARD.classList.add('songprev');
        setTimeout(() => {
            if(currentSong == 0) currentSong = songList.length - 1;
            else if(currentSong > 0) currentSong--;
            AUDIO.src = songList[currentSong].src;
            CARD.style.backgroundImage = `url(${songList[currentSong].srcImage})`;
            AUDIO_TITLE.innerHTML = `${songList[currentSong].author} — ${songList[currentSong].title}`;
        },250);
        songPlay();
    }

//PAUSE / PLAY BUTTON
    PAUSE_BUTTON.addEventListener('click', e => {
        if(isPlaying){
            AUDIO.pause();
            isPlaying = false;
            PAUSE_BUTTON.src = "icons/play.svg";
        } else songPlay();
    });
    function songPlay(){
        AUDIO.play();
        isPlaying = true;
        PAUSE_BUTTON.src = "icons/pause.svg";
    }

//NEXT BUTTON
    NEXT_BUTTON.addEventListener('click', e => { songNext() });
    function songNext(){
        CARD.classList.add('songnext');
        setTimeout(() => {
            if(currentSong == songList.length - 1) currentSong = 0;
            else if(currentSong < songList.length - 1) currentSong++;
            AUDIO.src = songList[currentSong].src;
            CARD.style.backgroundImage = `url(${songList[currentSong].srcImage})`;
            AUDIO_TITLE.textContent = `${songList[currentSong].author} — ${songList[currentSong].title}`;
            songPlay();
        },250)
        
    }

//LOOP BUTTON
    LOOP_BUTTON.addEventListener('click', e => {
        if(isLooped){
            isLooped = false;
            LOOP_BUTTON.src = "icons/notloop.svg";
        } else {
            isLooped = true;
            LOOP_BUTTON.src = "icons/loop.svg";
        }
    });

//VOLUME BUTTON
    VOLUME_BUTTON.addEventListener('click', e => {
        if(isMuted){
            setVolume(volume);
            VOLUME_BUTTON.src = "icons/volume.svg";
            isMuted = false;

        } else {
            volume = AUDIO.volume;
            setVolume(0);
            VOLUME_BUTTON.src = "icons/muted.svg";
            isMuted = true;
        }
    });

    VOLUME_ADJ_HOLDER.addEventListener('click', e => {
        let barHeight = VOLUME_ADJ_HOLDER.offsetHeight;
        let mousein = e.clientY - getElementTop(VOLUME_ADJ_HOLDER);
        let volumePercent = 1 - mousein / barHeight;
        setVolume(volumePercent);
    });

//VOLUME ADJUSTMENT
    VOLUME_ADJ.addEventListener('mouseover', (e) => { showVolume(true) });
    VOLUME_BUTTON.addEventListener('mouseover', () => { showVolume(true) });
    VOLUME_ADJ.addEventListener('mouseout', () => { showVolume(false) });

    function showVolume(bool){
        if(bool == true) VOLUME_ADJ.style.visibility = "visible";
        else if(bool == false) VOLUME_ADJ.style.visibility = "hidden";
    }

    function setVolume(value){
        AUDIO.volume = value;
        VOLUME_ADJ_ZIP.style.height = value*100 + "%";
    }
//TIME UPDATE
    AUDIO.addEventListener('timeupdate', e => {
        const duration = e.srcElement.duration;
        const currentTime = e.srcElement.currentTime;
        AUDIO_DURATION.innerHTML = secToMin(duration);
        AUDIO_PROGRESS.innerHTML = secToMin(currentTime);
        AUDIO_PROGRESSBAR.style.width = (currentTime / duration)*100 + "%";
        //PROGRESS BAR
        AUDIO_PROGRESSBAR_HOLDER.addEventListener('click', f => {
            let barWidth = AUDIO_PROGRESSBAR_HOLDER.offsetWidth;
            let mousein = f.clientX - getElementLeft(AUDIO_PROGRESSBAR_HOLDER);
            let progressPercent = (mousein / barWidth)
            e.srcElement.currentTime = progressPercent * e.srcElement.duration;
            AUDIO_PROGRESSBAR.style.width = (progressPercent)*100 + "%";
        });
        //SONG ENDS
        if(duration == currentTime && isLooped){
            e.srcElement.currentTime = 0;
            songPlay();
        }
        else if(duration == currentTime && !isLooped){
            songNext();
        }
    });

//ROW ANIMATIONS SUPPORT
    CARD.addEventListener('animationend', () => {
        CARD.classList.remove('songprev', 'songnext');
        showVolume(false);

    });

} //main() end


//CALCULATIN SECONDS TO MINUTES
function secToMin(seconds){
    if(seconds == undefined || seconds == null || isNaN(seconds)) return '0:00';
    seconds = Math.floor(seconds);
    let outputMinutes = Math.floor(seconds / 60);
    let outputSeconds = seconds%60;
    if(outputSeconds < 10) outputSeconds = "0" + outputSeconds;
    return `${outputMinutes}:${outputSeconds}`;
}
//GETS ELEMENT OFFSET FROM TOP
function getElementTop(element){
    let rectangle = element.getBoundingClientRect();
    return rectangle.y;
}
//GETS ELEMENT OFFSET FROM LEFT
function getElementLeft(element){
    let rectangle = element.getBoundingClientRect();
    return rectangle.x;
}


