import React, { useEffect, useRef, useState } from "react";
import { songsData } from '../seeds/songsData';
import { NO_REPEAT, REPEAT_PLAYLIST, REPEAT_ONE } from '../helpers/constants';
import { shuffle } from '../helpers/functions';
import { nanoid } from 'nanoid';

const SongContext = React.createContext()

function SongContextProvider({children}) {

    // update localstorage if seeds changed
    if (songsData.length !== JSON.parse(localStorage.getItem('songs'))?.length) {
        localStorage.clear()
    }
    
    // playlist states
    const [songs, setSongs] = useState(() => JSON.parse(localStorage.getItem('songs')) || songsData)
    const [currentSongId, setCurrentSongId] = useState((songs[0] && songs[0].id) || 0)
    const originalPlayList = useRef(songsData) // use to restore previous songs position when stop shuffling
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(songs[0] ? 0 : -1)

    // Custom playlist (CRUD songs & playlists)
    const [allPlaylists, setAllPlaylists] = useState(() =>
        JSON.parse(localStorage.getItem('allPlaylists')) ||[
            {
                id: nanoid(),
                name: 'Default Playlist',
                songs: songs
            }
        ]
    )
    const [currentPlaylistId, setCurrentPlaylistId] = useState((allPlaylists[0] && allPlaylists[0].id) || '')

    // audio's duration states & duration slider
    const [currentPlayingTime, setCurrentPlayingTime] = useState(0)

    // repeat & shuffle state
    const [repeat, setRepeat] = useState(NO_REPEAT)
    const [isShuffle, setIsShuffle] = useState(false)

    // audio track
    const track = useRef()

    // control mp3Player on mobile
    const [isMp3PlayerHidden, setIsMp3PlayerHidden] = useState(false)

    useEffect(() => {
        localStorage.setItem('allPlaylists', JSON.stringify(allPlaylists))

        let storedSongs = findCurrentPlaylist(currentPlaylistId).songs
        localStorage.setItem('songs', JSON.stringify(storedSongs))
    }, [allPlaylists])

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

    function loadTrack() {
        if (songs.length) {
            track.current.src = songs[currentIndex].path;
            track.current.load();
        }
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

    function findCurrentPlaylist(playListId) {
        return allPlaylists.find(playlist => (
            playlist.id === playListId
        )) || allPlaylists[0]
    }

    // update list of songs and reset all song's states when playlist changed
    function switchPlaylist(playListId) {
        // update songs
        const currentPlaylist = findCurrentPlaylist(playListId)
        const newSongs = currentPlaylist.songs
        setSongs(newSongs)

        // reset all song states
        resetAllSongsState(newSongs)

        // update current playlist id
        setCurrentPlaylistId(playListId)
    }

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

    function moveSongToTopList(event, song) {
        event.stopPropagation()

        const newSongs = songs.filter(oldSong => oldSong.id !== song.id)
        newSongs.unshift(song)
        setSongs(newSongs)

        setAllPlaylists(oldPlaylists => oldPlaylists.map(oldPlaylist => (
            oldPlaylist.id === currentPlaylistId ?
            {
                ...oldPlaylist,
                songs: newSongs
            } :
            oldPlaylist
        )))

        // reset all song states
        resetAllSongsState(newSongs)
    }

    function deleteThisSong(event, song) {
        event.stopPropagation()

        const newSongs = songs.filter(oldSong => oldSong.id !== song.id)
        setSongs(newSongs)
        setAllPlaylists(oldPlaylists => oldPlaylists.map(oldPlaylist => (
            oldPlaylist.id === currentPlaylistId ?
            {
                ...oldPlaylist,
                songs: newSongs
            } :
            oldPlaylist
        )))

        // reset all song states
        resetAllSongsState(newSongs)
    }

    function resetAllSongsState(newSongs) {
        pauseSong()
        originalPlayList.current = newSongs
        setIsShuffle(false)
        setIsPlaying(false)
        setCurrentIndex(newSongs[0] ? 0 : -1)
        setCurrentSongId(newSongs[0] ? newSongs[0].id : 0)
        setCurrentPlayingTime(0)
        track.current.currentTime = 0
    }

    return (
        <SongContext.Provider value={{
            songs,
            currentSongId,
            currentPlaylistId,
            currentIndex,
            playThisSong,
            currentPlaylist: () => findCurrentPlaylist(currentPlaylistId),
            moveSongToTopList,
            allPlaylists,
            deleteThisSong,
            setAllPlaylists,
            songsData,
            addSongToPlaylist,
            switchPlaylist,
            track,
            prevSong,
            justPlay,
            isPlaying,
            nextSong,
            currentPlayingTime,
            endSong,
            handleRepeat,
            repeat,
            shuffleSong,
            isShuffle,
            isMp3PlayerHidden,
            toggleShowingMp3Player,
            setCurrentPlayingTime
        }}>
            {children}
        </SongContext.Provider>
    )
}

export { SongContextProvider, SongContext }

