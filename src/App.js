import './App.css';
import { useEffect, useRef, useState } from 'react';
import { songsData } from './seeds/songsData';
import Mp3Player from './components/Mp3Player';
import { NO_REPEAT, REPEAT_PLAYLIST, REPEAT_ONE } from './helpers/constants';

function App() {

  // playlist states
  const [songs, setSongs] = useState(songsData)
  const originalPlayList = useRef(songsData) // use to restore previous songs position when stop shuffling
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
  const durationSlider = useRef()

  // repeat & shuffle state
  const [repeat, setRepeat] = useState(NO_REPEAT)
  const [isShuffle, setIsShuffle] = useState(false)

  // audio track & visualiser
  const visualyzer = useRef()
  const track = useRef()

  //  audio context & audio media source
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
      
      setCurrentPlayingTime(track.current.currentTime)
      setDurationSliderPosition(position)

      // change track's currentTime when duration slider changed
      track.current.currentTime = currentTime;
    }
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

  // will run when the song is over
  function endSong() {
    console.log('track ended')
    
    // replay playlist from song 1 if in REPEAT PLAYLIST mode
    if (repeat === REPEAT_PLAYLIST && currentIndex === songs.length - 1) {
      setCurrentPlayingTime(0)
      setCurrentIndex(0)
    } else if (repeat === REPEAT_ONE) {
      setCurrentPlayingTime(0)
      playSong()
    } else {
      if (currentIndex === songs.length - 1 && repeat !== REPEAT_PLAYLIST) {
        // stop song when ended if not in replay mode
        setIsPlaying(prevState => !prevState)
      } else {
        setCurrentPlayingTime(0)
        setCurrentIndex(prevIndex => {
          return (prevIndex < songs.length - 1) ? prevIndex + 1 : prevIndex
        })
        console.log('isplayingState = ', isPlaying)
      }
    }
  }

  function handleRepeat() {
    setRepeat(prevState => {
      if (prevState === NO_REPEAT) {
        return REPEAT_PLAYLIST
      } else if (prevState === REPEAT_PLAYLIST) {
        return REPEAT_ONE
      } else {
        return NO_REPEAT
      }
    })
  }

  // shuffle others but keep the current song position
  function shuffleSong() {
    setIsShuffle(prevState => !prevState)

    if (!isShuffle) {
      setSongs(oldSongs => {
        // store current songs position before shuffling
        originalPlayList.current = oldSongs

        let arrayA = oldSongs.slice(0, currentIndex)
        let arrayB = oldSongs.slice(currentIndex + 1, oldSongs.length)
        let result = oldSongs

        if(!arrayA.length) {
          let oldSong = oldSongs[currentIndex]
          let shouldShuffleArray = oldSongs.slice(currentIndex + 1, oldSongs.length)
          result = [
            oldSong,
            ...shuffle(shouldShuffleArray)
          ]
        } else if (arrayA.length === oldSongs.length - 1) {
          let oldSong = oldSongs[currentIndex]
          let shouldShuffleArray = oldSongs.slice(0, oldSongs.length - 1)
          result = [
            ...shuffle(shouldShuffleArray),
            oldSong
          ]
        } else {
          let oldSong = oldSongs[currentIndex]          
          let firstArray = shuffle(arrayA)
          let secondArray = shuffle(arrayB)
          result = [
            ...firstArray,
            oldSong,
            ...secondArray
          ]
        }

        return result
      })
    } else {
      // only restore previous playlist if current song position same on both shuffled list and old list
      if (originalPlayList.current[currentIndex].id === songs[currentIndex].id) {
        setSongs(originalPlayList.current)
      }
    }
  }

  function shuffle(array) { // Fisher-Yates Shuffle
    let currentIndex = array.length,  randomIndex
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }
  
    return array
  }
    
  const songElements = songs.map(song => (
    <p key={song.id} className={song.id === songs[currentIndex].id ? 'bg-orange' : ''}>{song.name} - {song.singer}</p>
  ))

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
        audioLoaded={audioLoaded}
        fullDuration={fullDuration}
        durationSliderPosition={durationSliderPosition}
        endSong={endSong}
        visualyzer={visualyzer}
        handleRepeat={handleRepeat}
        repeat={repeat}
        shuffleSong={shuffleSong}
        isShuffle={isShuffle}
      />

      <div>
         <h1>Playlist</h1>
         {songElements}
      </div>
    </main>
  );
}

export default App;
