import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getDurationInMinutes } from '../helpers/functions'
import Visualyzer from './Visualyzer'
import { REPEAT_PLAYLIST, REPEAT_ONE } from '../helpers/constants';
import { SongContext } from '../contexts/SongContext';
import { useContext, useEffect, useRef, useState } from 'react';

export default function Mp3Player() {
    // volume states & volume slider and mute state
    const [volume, setVolume] = useState(100)
    const prevVolume = useRef(0) // store previous volume
    const volumeSlider= useRef()
    const [mute, setMute] = useState(false)

    // global context as props
    const props = useContext(SongContext)

    // duration slider
    const [durationSliderPosition, setDurationSliderPosition] = useState(0)
    const durationSlider = useRef()

    const [fullDuration, setFullDuration] = useState(0)

    // update track's volume when volume changed
    useEffect(() => {
        props.track.current.volume = volume / 100
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

    // reset duration slider
    useEffect(() => {
        setDurationSliderPosition(0)
        setFullDuration(0)
    }, [props.currentIndex, props.currentSongId, props.currentPlaylistId])

    function muteSound() {
        // store previous volume for later resume when mute = false
        if (!mute) {
             prevVolume.current = volume
        }

        setMute(prevMute => !prevMute)
    }

     // change volume
     function changeVolume() {
        setVolume(volumeSlider.current.value)
    }

    function changeDuration() {
        let position = 0
        let currentTimeAfterSliding = 0

        // update slider position & track's currentTime
        if(!isNaN(props.track.current.duration)){
            position = props.track.current.currentTime * (100 / props.track.current.duration)
            currentTimeAfterSliding = props.track.current.duration * (durationSlider.current.value / 100)

            props.setCurrentPlayingTime(props.track.current.currentTime)
            setDurationSliderPosition(position)

            // change track's currentTime when duration slider changed
            props.track.current.currentTime = currentTimeAfterSliding;
        }
    }

    function songPlaying(){
        let position = 0;

        // update slider position
        if(!isNaN(props.track.current.duration)){
            position = props.track.current.currentTime * (100 / props.track.current.duration);

            props.setCurrentPlayingTime(props.track.current.currentTime)
            setDurationSliderPosition(position)
        }
    }

    function audioLoaded() {
        setFullDuration(props.track.current.duration)
    }

    return (
        <div className={`player ${props.isMp3PlayerHidden ? 'hidden' : ''}`}>
            <p id="logo" onClick={props.toggleShowingMp3Player}>
                <span>
                    <FontAwesomeIcon icon="fa-solid fa-music" />
                </span>
                Music
            </p>

            {/* Left part */}
            <div className='left'>
                {/* song image */}
                <div className='image-track-container'>
                    {
                        props.songs.length > 0 &&
                        <img
                            src={props.songs[props.currentIndex].img}
                            className={[props.isPlaying && 'blur-img']}
                        />
                    }
                    

                    <Visualyzer />
                </div>
                <div className='volume'>
                    <p id='volume--show'>{ volume }</p>
                    <span id="volume_icon" onClick={muteSound}>
                    {
                        mute
                        ?
                        <FontAwesomeIcon icon="fa-solid fa-volume-xmark" />
                        :
                        <FontAwesomeIcon icon="fa-solid fa-volume-high" />
                    }
                    </span>
                    <input type="range" min="0" max="100" value={volume} onChange={changeVolume} id="volume" ref={volumeSlider} />
                </div>
            </div>

            {/* right part */}
            <div className='right'>
                <div className='show_song_no' onClick={props.toggleShowingMp3Player}>
                    <span id='present'>{props.currentIndex + 1}</span>
                    <span>/</span>
                    <span id='total'>{ props.songs.length }</span>
                </div>

                {/* song title & artist name */}
                <div className='song-info' onClick={props.toggleShowingMp3Player}>
                    <p id='title'>{ props.songs.length > 0 ? props.songs[props.currentIndex].name : "(no song's title)" }</p>
                    <p id='artist'>{ props.songs.length > 0 ? props.songs[props.currentIndex].singer : "(no singer's name)" }</p>
                </div>

                {/* middle part */}
                <div className='middle'>
                    <audio
                        ref={props.track}
                        hidden={true}
                        onTimeUpdate={songPlaying}
                        onLoadedData={audioLoaded}
                        onEnded={props.endSong}
                    />
                    <button
                        onClick={props.shuffleSong}
                        className={props.isShuffle ? 'bg-orange' : 'bg-transparent'}
                    >
                        <span><FontAwesomeIcon icon="fa-solid fa-shuffle" /></span>
                    </button>

                    <button onClick={props.prevSong}>
                        <span><FontAwesomeIcon icon="fa-solid fa-backward-step" /></span>
                    </button>

                    <button onClick={props.justPlay} id="play">
                        <span>
                            {
                            props.isPlaying
                            ?
                            <FontAwesomeIcon icon="fa-solid fa-pause" />
                            :
                            <FontAwesomeIcon icon="fa-solid fa-play" />
                            }
                        </span>
                    </button>

                    <button onClick={props.nextSong}>
                        <span><FontAwesomeIcon icon="fa-solid fa-forward-step" /></span>
                    </button>

                    <button
                        onClick={props.handleRepeat}
                        className={`repeat--button ${(props.repeat === REPEAT_PLAYLIST || props.repeat === REPEAT_ONE) ? 'bg-orange' : 'bg-transparent'}`}
                    >
                        <span>
                            {props.repeat === REPEAT_ONE && <span className='repeat-one'>1</span>}
                            <FontAwesomeIcon icon="fa-solid fa-repeat" />
                        </span>
                    </button>
                </div>

                {/* song duration part */}
                <div className='duration'>
                    <input type="range" min="0" max="100" value={durationSliderPosition}  onChange={changeDuration} ref={durationSlider} />
                    <p className='duration--display'>{ getDurationInMinutes(props.currentPlayingTime) } / {getDurationInMinutes(fullDuration)}</p>
                </div>
            </div>
        </div>
    )
}