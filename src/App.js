import './App.css';
import { useEffect, useRef, useState } from 'react';
import { songsData } from './seeds/songsData';
import Mp3Player from './components/Mp3Player';

function App() {

  // playlist states
  const [songs, setSongs] = useState(songsData)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // volume states & volume slider and mute state
  const [volume, setVolume] = useState(100)
  const prevVolume = useRef(0) // store previous volume
  const volumeSlider= useRef()
  const [mute, setMute] = useState(false)

  // audio's duration states & duration slider
  const [currentPlayingTime, setCurrentPlayingTime] = useState(0)
  const [fullDuration, setFullDuration] = useState(0) 
  const [durationSliderPosition, setDurationSliderPosition] = useState(0)
  const durationSlider =  useRef()

  const auto_play =  useRef()
  const visualyzer = useRef()
  const track = useRef()

  //  context
  const audioContext = useRef()
  const audioSource = useRef()

  useEffect(() => { 
    // load track
    loadTrack()
  }, [])

  useEffect(() => {
    // load track & play song when index changed
    loadTrack()
    
    if (isPlaying) {
      playSong()
    }

    // update title
    document.title = songs[currentIndex].name + ' - ' + songs[currentIndex].singer
  }, [currentIndex])

  // update track's volume when volume changed
  useEffect(() => {
    track.current.volume = volume / 100
  }, [volume])

  // change volume to 0 when mute = true, if not use previous volume state
  useEffect(() => {
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
    resetDurationSlider()

    track.current.src = songs[currentIndex].path;
    track.current.load();
  }

  function songPlaying(){
    let position = 0;
          
    // update slider position
    if(!isNaN(track.current.duration)){
      position = track.current.currentTime * (100 / track.current.duration);
      
      setCurrentPlayingTime(track.current.currentTime)
      setDurationSliderPosition(position)
    }
  }

  function resetDurationSlider(){
    setDurationSliderPosition(0)
  }

  // change volume
  function changeVolume() {
    setVolume(volumeSlider.current.value)
  }

  // Play or pause song
  function justPlay() {
    console.log('just Play')
    setIsPlaying(prevState => !prevState)

    if(!isPlaying) {
      playSong()
    } else {
      pauseSong()
    }
  }

  function playSong() {
    track.current.play();

    if (!audioContext.current) {
      createVisualyzer();
    }
  }

  function createVisualyzer() {
    audioContext.current = audioContext.current || new AudioContext()
    audioSource.current = audioSource.current || audioContext.current.createMediaElementSource(track.current)
    const analyser = audioContext.current.createAnalyser();

    audioSource.current.connect(analyser)
    analyser.connect(audioContext.current.destination)
    analyser.fftSize = 64

    const bufferLength = analyser.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)

    let elements = []
    for(let i = 0; i < bufferLength; i++) {
        const element = document.createElement('span')
        element.classList.add('visualyzer--element')
        elements.push(element)
        visualyzer.current.appendChild(element)
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

    let position = 0
    let currentTime = 0
          
    // update slider position & track's currentTime
    if(!isNaN(track.current.duration)){
      position = track.current.currentTime * (100 / track.current.duration)
      currentTime = track.current.duration * (durationSlider.current.value / 100)
      
      setCurrentPlayingTime(currentTime)
      setDurationSliderPosition(position)

      // change track's currentTime when duration slider changed
      track.current.currentTime = currentTime;
    }
  }

  function autoplaySwitch() {
    console.log('AutoplaySwitch')
  }

  function muteSound() {
    // store previous volume for later resume when mute = false
    if (!mute) {
      prevVolume.current = volume
    }

    setMute(prevMute => !prevMute)
  }

  function audioLoaded() {
    console.log('audio Loaded')

    setFullDuration(track.current.duration)
  }

  function endSong() {
    // will run when the song is over
    console.log('track ended')
    setIsPlaying(prevState => !prevState)
    setCurrentPlayingTime(0)
    setCurrentIndex(prevIndex => {
      return (prevIndex < songs.length - 1) ? prevIndex + 1 : prevIndex
    })
  }

  return (
    <main>
      <Mp3Player 
        songs={songs}
        currentIndex={currentIndex}
        volume={volume}
        muteSound={muteSound}
        mute={mute}
        changeVolume={changeVolume}
        volumeSlider={volumeSlider}
        songPlaying={songPlaying}
        track={track}
        prevSong={prevSong}
        justPlay={justPlay}
        isPlaying={isPlaying}
        nextSong={nextSong}
        changeDuration={changeDuration}
        durationSlider={durationSlider}
        currentPlayingTime={currentPlayingTime}
        autoplaySwitch={autoplaySwitch}
        auto_play={auto_play}
        audioLoaded={audioLoaded}
        fullDuration={fullDuration}
        durationSliderPosition={durationSliderPosition}
        endSong={endSong}
        visualyzer={visualyzer}
      />
    </main>
  );
}

export default App;
