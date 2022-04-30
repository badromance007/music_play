import './App.css';
import { useEffect, useRef, useState } from 'react';
import { songsData } from './seeds/songsData';
import Mp3Player from './components/Mp3Player';
import { NO_REPEAT, REPEAT_PLAYLIST, REPEAT_ONE } from './helpers/constants';
import { shuffle } from './helpers/functions';
import Playlist from './components/Playlist';
import { nanoid } from 'nanoid';
import Modal from './components/Modal';
import { truncateString } from './helpers/functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function App() {

  // playlist states
  const [songs, setSongs] = useState(songsData)
  const [currentSongId, setCurrentSongId] = useState((songs[0] && songs[0].id) || 0)
  const originalPlayList = useRef(songsData) // use to restore previous songs position when stop shuffling
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(songs[0] ? 0 : -1)

  // Custom playlist (CRUD songs & playlists)
  const [allPlaylists, setAllPlaylists] = useState(
    [
      {
        id: nanoid(),
        name: 'Default Playlist',
        songs: songs
      }
    ]
  )
  const [currentPlaylistId, setCurrentPlaylistId] = useState((allPlaylists[0] && allPlaylists[0].id) || '')

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

  // control mp3Player on mobile
  const [isMp3PlayerHidden, setIsMp3PlayerHidden] = useState(false)

  useEffect(() => {
    // load track & play song when song index changed or currentSongId changed or currentplaylistId changed
    loadTrack()
    
    if (isPlaying) {
      playSong()
    }

    // update title
    if (songs.length)
      document.title = songs[currentIndex].name + ' - ' + songs[currentIndex].singer + ' | ' + findCurrentPlaylist(currentPlaylistId).name
    else
      document.title = findCurrentPlaylist(currentPlaylistId).name
  }, [currentIndex, currentSongId, currentPlaylistId])

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
    resetDurationSlider()

    if (songs.length) {
      track.current.src = songs[currentIndex].path;
      track.current.load();
    }
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
    setIsPlaying(prevState => !prevState)

    if(!isPlaying) {
      playSong()
    } else {
      pauseSong()
    }
  }

  function playSong() {
    if (currentIndex >= 0 && currentSongId) {
      track.current.play();
    }

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
    setCurrentIndex(prevIndex => (
      prevIndex > 0 ?
      prevIndex - 1 :
      songs.length - 1 
    ))
  }

  function nextSong() {
    setCurrentIndex(prevIndex => (
      prevIndex < songs.length - 1 ?
      prevIndex + 1 :
      0
    ))
  }

  function changeDuration() {
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
    setFullDuration(track.current.duration)
  }

  // will run when the song is over
  function endSong() {
    // replay playlist from song 1 if in REPEAT PLAYLIST mode
    if (repeat === REPEAT_PLAYLIST && currentIndex === songs.length - 1) {
      setCurrentPlayingTime(0)
      setCurrentIndex(0)

      // repeat if playlist has just 1 song
      if (songs.length === 1) playSong()
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

        const oldSong = oldSongs[currentIndex]
        const cutSongsLeft = oldSongs.slice(0, currentIndex)
        const cutSongsRight = oldSongs.slice(currentIndex + 1, oldSongs.length)
        let shuffledResult = oldSongs // store shuffled result

        if(!cutSongsLeft.length) { // current song at begining
          let remainingSongs = oldSongs.slice(currentIndex + 1, oldSongs.length)
          shuffledResult = [
            oldSong,
            ...shuffle(remainingSongs)
          ]
        } else if (cutSongsLeft.length === oldSongs.length - 1) { // current song at the end
          let remainingSongs = oldSongs.slice(0, oldSongs.length - 1)
          shuffledResult = [
            ...shuffle(remainingSongs),
            oldSong
          ]
        } else { // current song in the middle
          let newJoinedRemainingSongs = [...cutSongsLeft, ...cutSongsRight]
          let newShuffledRemainingSongs = shuffle(newJoinedRemainingSongs)

          let firstPartSongs = newShuffledRemainingSongs.slice(0, cutSongsLeft.length)
          let secondPartSongs = newShuffledRemainingSongs.slice(cutSongsLeft.length, newShuffledRemainingSongs.length)

          shuffledResult = [
            ...firstPartSongs,
            oldSong,
            ...secondPartSongs
          ]
        }

        return shuffledResult
      })
    } else {
      // only restore previous playlist if current song position same on both shuffled list and old list
      if (originalPlayList.current[currentIndex].id === songs[currentIndex].id) {
        setSongs(originalPlayList.current)
      }
    }
  }

  function playThisSong(songIndex) {
    setIsPlaying(true)
    setCurrentIndex(songIndex)
    playSong()

    // turn on mp3player on mobile
    toggleShowingMp3Player()
  }

  // toggle show mp3 player when on mobile device
  function toggleShowingMp3Player() {
    if (window.innerWidth <= 768) {
      setIsMp3PlayerHidden(prevState => !prevState)
    }
  }
  
  // always show mp3 player when on large device
  useEffect(() => {
    function watchScreenWidthChanging() {
      if (window.innerWidth > 768) {
        setIsMp3PlayerHidden(false)
      }
    }

    window.addEventListener('resize', watchScreenWidthChanging)

    return function() { // cleanup function, will run when App component is unmounted
      window.removeEventListener('resize', watchScreenWidthChanging)
    }
  }, [])

  function openPlaylistModal() {
    setIsPlaylistModalShow(true)
  }
  function openAddSongToPlaylistModal() {
    setIsAddSongToPlaylistModalShow(true)
  }
  function openCreatePlaylistModal() {
    setIsCreatePlaylistModalShow(true)
  }

  function closeModal(event) {
    document.querySelector('#modal-container').classList.add('out')
    document.querySelector('body').classList.remove('modal-active');
    setTimeout(() => {
      setIsPlaylistModalShow(false)
      setIsAddSongToPlaylistModalShow(false)
      setIsCreatePlaylistModalShow(false)
    }, 500)

    setIsEditingPlaylist(false)
  }

  function findCurrentPlaylist(playListId) {
    return allPlaylists.find(playlist => (
      playlist.id === playListId
    )) || allPlaylists[0]
  }

  // update list of songs and reset all song's states when playlist changed
  function switchPlaylist(playListId) {
    // update songs
    const currentPlaylist = findCurrentPlaylist(playListId)
    setSongs(currentPlaylist.songs)

    // reset all song states
    pauseSong()
    originalPlayList.current = currentPlaylist.songs
    setIsShuffle(false)
    setIsPlaying(false)
    setCurrentIndex(currentPlaylist.songs[0] ? 0 : -1)
    setCurrentSongId(currentPlaylist.songs[0] ? currentPlaylist.songs[0].id : 0)
    setCurrentPlayingTime(0)
    setDurationSliderPosition(0)
    track.current.currentTime = 0;
    setFullDuration(0)

    // update current playlist id
    setCurrentPlaylistId(playListId)


    setIsEditingPlaylist(false)
  }

  const [isPlaylistModalShow, setIsPlaylistModalShow] = useState(false)
  const [isCreatePlaylistModalShow, setIsCreatePlaylistModalShow] = useState(false)
  const [isAddSongToPlaylistModalShow, setIsAddSongToPlaylistModalShow] = useState(false)
  const defaultFormData = useRef({
    playlistName: ''
  })
  const [formData, setFormData] = useState(defaultFormData.current)
  useEffect(() => {
    if (isPlaylistModalShow || isAddSongToPlaylistModalShow || isCreatePlaylistModalShow) {
      document.querySelector('#modal-container').removeAttribute('class')
      document.querySelector('#modal-container').classList.add('fast')
      document.querySelector('body').classList.add('modal-active')
    }
  }, [isPlaylistModalShow, isAddSongToPlaylistModalShow, isCreatePlaylistModalShow])

  function addSongToPlaylist(song, playlist) {
    if (currentIndex < 0)
      setCurrentIndex(0)

    if (!playlist.songs.length)
      setCurrentSongId(song.id)
      
    setSongs(prevSongs => [...prevSongs, song])
    setAllPlaylists(prevPlaylists => prevPlaylists.map(oldPlaylist => (
      oldPlaylist.id === playlist.id ?
      {
        ...oldPlaylist,
        songs: [...oldPlaylist.songs, song]
      } :
      oldPlaylist
    )))
  }

  const currentPlaylist = findCurrentPlaylist(currentPlaylistId)
 
  const remainingSongs = songsData.filter(oldSong => currentPlaylist.songs.every(song => oldSong.id !== song.id))
  const remainingSongsElements = remainingSongs.map(song => {
        return <div
            key={song.id}
            className={`modal--body_songs`}
            onClick={() => addSongToPlaylist(song, currentPlaylist)}
        >   
          <span>
            <img src={song.img} width="40" height="40" />
          </span>
          <span>
            {truncateString((`${song.name} - ${song.singer}`), 80)}
          </span>
        </div>
  })

  function handleFormChange(event) {
    const { name, value } = event.target
    setFormData(prevData => (
      {
        ...prevData,
        [name]: value
      }
    ))
  }

  const errorMessage = useRef()

  function createNewPlaylist(event) {
    event.preventDefault()

    if (formData.playlistName.trim().length) {
      setAllPlaylists(prevPlaylists => {
        return [
          ...prevPlaylists,
          {
            id: nanoid(),
            name: formData.playlistName,
            songs: []
          }
        ]
      })
      errorMessage.current.innerHTML = "<span style='color: green'>Playlist <strong>" + 
        formData.playlistName + "</strong> has been created successfully!</span>"
    } else {
      errorMessage.current.innerHTML = "<span style='color: red'>Please enter a playlist name.</span>"
    }

    // reset form
    setFormData(defaultFormData.current)
  }

  function deletePlaylist(event, playlistId) {
    event.stopPropagation()

    if (playlistId !== currentPlaylistId)
      setAllPlaylists(oldPlaylists => oldPlaylists.filter(oldPlaylist => oldPlaylist.id !== playlistId))
  }

  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false)
  const [targetingPlaylistId, setTargetingPlaylistId] = useState('')

  function editPlaylist(event, playlistId) {
    event.stopPropagation()

    if (playlistId !== currentPlaylistId) {
      setIsEditingPlaylist(prevState => !prevState)
      setTargetingPlaylistId(playlistId)
      console.log('edit playlist')


      setFormData(prevFormData => ({
        ...prevFormData,
        playlistName: findCurrentPlaylist(playlistId).name
      }))
    }
  }

  function preventPopaganda(event) {
    event.stopPropagation()
  }

  function updatePlaylistName(event, playlistId) {
    event.preventDefault()

    if (formData.playlistName.trim().length) {
      setAllPlaylists(oldPlaylists => oldPlaylists.map(oldPlaylist => (
        oldPlaylist.id === playlistId ?
        {
          ...oldPlaylist,
          name: formData.playlistName
        } :
        oldPlaylist
      )))
      // errorMessage.current.innerHTML = "<span style='color: green'>Playlist <strong>" + 
      //   formData.playlistName + "</strong> has been created successfully!</span>"

      setIsEditingPlaylist(false)
    } else {
      // errorMessage.current.innerHTML = "<span style='color: red'>Please enter a playlist name.</span>"
    }
  }

  useEffect(() => {
    if (!isEditingPlaylist) {
      // reset form
      setFormData(defaultFormData.current)
    }
  }, [isEditingPlaylist])

  return (
    <main>
      <Playlist
        songs={songs}
        currentIndex={currentIndex}
        playThisSong={playThisSong}
        openPlaylistModal={openPlaylistModal}
        openAddSongToPlaylistModal={openAddSongToPlaylistModal}
        openCreatePlaylistModal={openCreatePlaylistModal}
        currentPlaylist={() => findCurrentPlaylist(currentPlaylistId)}
      />
      <br />
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
        isMp3PlayerHidden={isMp3PlayerHidden}
        toggleShowingMp3Player={toggleShowingMp3Player}
      />

      {
        isPlaylistModalShow &&
        <Modal
          title="Choose a playlist to play"
          closeModal={closeModal}
        >
          <div className='modal--body_playlist-container'>
            {
              allPlaylists.map(playlist => {
                  return <div
                      key={playlist.id}
                      className={`modal--body_playlist ${currentPlaylistId === playlist.id ? 'bg-purple' : ''}`}
                      onClick={() => switchPlaylist(playlist.id)}
                  >   
                      {
                        (isEditingPlaylist && playlist.id === targetingPlaylistId)
                        ?
                          <form onSubmit={(event, playlistId) => updatePlaylistName(event, playlist.id)}>
                            <input
                              type="text"
                              name="playlistName"
                              placeholder="Playlist name"
                              autoComplete="off"
                              value={formData.playlistName}
                              onChange={handleFormChange}
                              onClick={(event) => preventPopaganda(event)}
                            />
                            <button onClick={(event) => preventPopaganda(event)}>Update</button>
                          </form>
                        :
                        <span>
                          {truncateString(playlist.name, 80)}
                        </span>
                      }
                      <div>
                        {
                          (currentPlaylistId !== playlist.id && playlist.id !== allPlaylists[0].id) &&
                          <>
                            <span
                              onClick={(event, playlistId) => editPlaylist(event, playlist.id)}
                            >
                              <FontAwesomeIcon icon="fa-solid fa-pen-to-square" />
                            </span>
                            <span
                              onClick={(event, playlistId) => deletePlaylist(event, playlist.id)}
                            >
                              <FontAwesomeIcon icon="fa-solid fa-trash-can" />
                            </span>
                          </>
                        }
                      </div>
                  </div>
              })
            }
          </div>
        </Modal>
      }

      {
        isAddSongToPlaylistModalShow &&
        <Modal
          title={`Choose song to add to ${truncateString(findCurrentPlaylist(currentPlaylistId).name, 16)}`}
          closeModal={closeModal}
        >
          <div className='modal--body_songs-container'>
            {remainingSongsElements}
            {!remainingSongsElements.length && <p style={{padding: '20px'}}>No more songs to add.</p>}
          </div>
        </Modal>
      }

      {
        isCreatePlaylistModalShow &&
        <Modal
          title="Create new playlist"
          closeModal={closeModal}
        >
          <div className='modal--body_form-container'>
            <div ref={errorMessage}></div>
            <form onSubmit={(event) => createNewPlaylist(event)}>
              <input
                type="text"
                name="playlistName"
                placeholder="Playlist name"
                autoComplete="off"
                value={formData.playlistName}
                onChange={handleFormChange}
              />
              <button>Create</button>
            </form>
          </div>
        </Modal>
      }
    </main>
  );
}

export default App;
