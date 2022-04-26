import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getDurationInMinutes } from '../helpers/functions'
import Visualyzer from './Visualyzer'

export default function Mp3Player(props) {
    return (
        <div className='player'>
            <p id="logo">
            <span>
                <FontAwesomeIcon icon="fa-solid fa-music" />
            </span>
            Music
            </p>

            {/* Left part */}
            <div className='left'>
            
            {/* song image */}
            <div className='image-track-container'>
                <img
                    ref={props.trackImage}
                    src={props.songs[props.currentIndex].img}
                    className={[props.isPlaying && 'blur-img']}
                />

                <Visualyzer
                    visualyzer={props.visualyzer}
                    isPlaying={props.isPlaying}
                />
            </div>
            <div className='volume'>
                <p id='volume_show'>{ props.volume }</p>
                <span id="volume_icon" onClick={props.muteSound}>
                {
                    props.mute
                    ?
                    <FontAwesomeIcon icon="fa-solid fa-volume-xmark" />
                    :
                    <FontAwesomeIcon icon="fa-solid fa-volume-high" />
                }
                </span>
                <input type="range" min="0" max="100" value={props.volume} onChange={props.changeVolume} id="volume" ref={props.volumeSlider} />
            </div>
            </div>

            {/* right part */}
            <div className='right'>
            <div className='show_song_no'>
                <span id='present'>{props.currentIndex + 1}</span>
                <span>/</span>
                <span id='total'>{ props.songs.length }</span>
            </div>

            {/* song title & artist name */}
            <div className='song-info'>
                <p id='title'>{ props.songs[props.currentIndex].name }</p>
                <p id='artist'>{ props.songs[props.currentIndex].singer }</p>
            </div>

            {/* middle part */}
            <div className='middle'>
                <audio
                    ref={props.track}
                    hidden={true}
                    onTimeUpdate={props.rangeSlider}
                    onLoadedData={props.firstLoad}
                    onEnded={props.endSong}
                />
                <button onClick={props.prevSong} id="pre">
                <span><FontAwesomeIcon icon="fa-solid fa-backward-step" /></span>
                </button>

                <button onClick={props.justPlay} id="play" ref={props.play}>
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

                <button onClick={props.nextSong} id="next">
                <span><FontAwesomeIcon icon="fa-solid fa-forward-step" /></span>
                </button>
            </div>

            {/* song duration part */}
            <div className='duration'>
                <input type="range" min="0" max="100" value={props.sliderPosition} id="duration_slider"  onChange={props.changeDuration} ref={props.slider} />
                <p>{ getDurationInMinutes(props.displayDuration) } / {getDurationInMinutes(props.fullDuration)}</p>
            </div>

            <button id='auto' onClick={props.autoplaySwitch} ref={props.auto_play}>Auto play <span><FontAwesomeIcon icon="fa-solid fa-circle-notch" /></span></button>
            </div>
        </div>
    )
}