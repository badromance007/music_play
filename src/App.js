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
      />
    </main>
  );
}

export default App;
