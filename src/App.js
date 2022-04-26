import './App.css';
import { useEffect, useRef, useState } from 'react';
import { songsData } from './seeds/songsData';
import Mp3Player from './components/Mp3Player';

function App() {
  const [songs, setSongs] = useState(songsData)
  const [playingSong, setPlayingSong] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(100)
  const prevVolume = useRef(0) // store previous volume
  const [duration, setDuration] = useState({
    position: 0,
    currentTime: 0
  })
  const [displayDuration, setDisplayDuration] = useState(0)
  const [fullDuration, setFullDuration] = useState(0) 
  const [mute, setMute] = useState(false)

  const play =  useRef()
  const recentVolume= useRef()
  const slider =  useRef()
  const auto_play =  useRef()

  const track = useRef()

  useEffect(() => { 
    // load track
    loadTrack()
  }, [])

  useEffect(() => {
    // load track & play song when index changed
    loadTrack()
    
    if (playingSong) {
      playSong()
    }

    // update title
    document.title = songs[currentIndex].name
  }, [currentIndex])

  useEffect(() => {
    // change track's volume when volume changed
    track.current.volume = volume / 100
  }, [volume])

  useEffect(() => {
    // change track's currentTime when slider changed
    track.current.currentTime = duration.currentTime;
  }, [duration])

  useEffect(() => {
    // change volume when mute = true, if not use previous volume
    setVolume(prevSound => {
      if(!mute) {
        return prevVolume.current > 0 ? prevVolume.current : prevSound
      } else {
        return 0
      }
    })
  }, [mute])

  function loadTrack() {
    console.log('load track')
    resetSlider()

    track.current.src = songs[currentIndex].path;
    track.current.load();
  }

  function rangeSlider(){
    console.log('Calling rangeSlider (onTimeUpdate event): ', track.current.duration) 
    let position = 0;
          
    // update slider position
    if(!isNaN(track.current.duration)){
      position = track.current.currentTime * (100 / track.current.duration);
      slider.current.value = position;

      setDisplayDuration(track.current.currentTime)
    }
  
    // will run when the song is over
    if(track.current.ended){
      // setPlayingSong(prevState => !prevState)
      setCurrentIndex(prevIndex => {
        return prevIndex < songs.length - 1 ? prevIndex + 1 : prevIndex
      })
    }
  }

  // reset song slider
  function resetSlider(){
    slider.current.value = 0;
  }

  // change volume
  function volumeChange() {
    console.log('volume change')
    setVolume(recentVolume.current.value)
  }

  // Play or pause song
  function justPlay() {
    console.log('just Play')
    setPlayingSong(prevState => !prevState)

    if(!playingSong) {
      playSong()
    } else {
      pauseSong()
    }
  }

  function playSong() {
    track.current.play();

    document.querySelector('#track_image').classList.add('blur-img')

    const visualizer = document.querySelector('.visualizer')

    const audioContext = new AudioContext()
    const audioSource = audioContext.createMediaElementSource(track.current)
    const analyser = audioContext.createAnalyser();

    audioSource.connect(analyser)
    analyser.connect(audioContext.destination)
    analyser.fftSize = 64

    const bufferLength = analyser.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)

    let elements = []
    for(let i = 0; i < bufferLength; i++) {
        const element = document.createElement('span')
        element.classList.add('visualyzer--element')
        elements.push(element)
        visualizer.appendChild(element)
    }

    const clamp = (num, min, max) => {
        if (num >= max) return max
        if (num <= min) return min
        return num
    }

    function animate() {
        requestAnimationFrame(animate)
        analyser.getByteFrequencyData(dataArray)
        
        for(let i = 0; i < bufferLength; i++) {
            let item = dataArray[i]
            item = item > 90 ? item / 3 : item * 1.95
            elements[i].style.transform = `rotateZ(${i * (360 / bufferLength)}deg) translate(-50%, ${clamp(item, 60, 90)}px)`
        }
    }

    animate()
  }

  function pauseSong() {
    track.current.pause();
  }

  function prevSong() {
    console.log('prevSong', currentIndex)

    setCurrentIndex(prevIndex => (
      prevIndex > 0 ?
      prevIndex - 1 :
      songs.length - 1 
    ))
  }

  function nextSong() {
    console.log('nextSong')

    setCurrentIndex(prevIndex => (
      prevIndex < songs.length - 1 ?
      prevIndex + 1 :
      0
    ))
  }

  function changeDuration() {
    console.log('changeDuration')
    setDuration({
      position: slider.current.value,
      currentTime: track.current.duration * (slider.current.value / 100)
    })
  }

  function autoplaySwitch() {
    console.log('AutoplaySwitch')
  }

  function muteSound() {
    setMute(prevMute => !prevMute)

    if (!mute) {
      prevVolume.current = volume // store previous volume
    }
  }

  function firstLoad() {
    console.log('audio Loaded')

    setFullDuration(track.current.duration)
  }

  return (
    <main>
      <Mp3Player 
        songs={songs}
        currentIndex={currentIndex}
        volume={volume}
        muteSound={muteSound}
        mute={mute}
        volumeChange={volumeChange}
        recentVolume={recentVolume}
        rangeSlider={rangeSlider}
        track={track}
        prevSong={prevSong}
        justPlay={justPlay}
        play={play}
        playingSong={playingSong}
        nextSong={nextSong}
        duration={duration}
        changeDuration={changeDuration}
        slider={slider}
        displayDuration={displayDuration}
        autoplaySwitch={autoplaySwitch}
        auto_play={auto_play}
        firstLoad={firstLoad}
        fullDuration={fullDuration}
      />
    </main>
  );
}

export default App;
