import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getDurationInMinutes } from '../helpers/functions'
import Visualyzer from './Visualyzer'
import { NO_REPEAT, REPEAT_PLAYLIST, REPEAT_ONE } from '../helpers/constants';

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
                        src={props.songs[props.currentIndex].img}
                        className={[props.isPlaying && 'blur-img']}
                    />

                    <Visualyzer
                        visualyzer={props.visualyzer}
                        isPlaying={props.isPlaying}
                    />
                </div>
                <div className='volume'>
                    <p id='volume--show'>{ props.volume }</p>
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
                        onTimeUpdate={props.songPlaying}
                        onLoadedData={props.audioLoaded}
                        onEnded={props.endSong}
                    />
                    <button
                        onClick={props.shuffleSong}
                        className={`${props.isShuffle && 'bg-orange'}`}
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
                        className={`${(props.repeat === REPEAT_PLAYLIST || props.repeat === REPEAT_ONE) && 'bg-orange'}`}
                    >
                        <span>
                            {props.repeat === REPEAT_ONE && <span className='repeat-one'>1</span>}
                            <FontAwesomeIcon icon="fa-solid fa-repeat" />
                        </span>
                    </button>
                </div>

                {/* song duration part */}
                <div className='duration'>
                    <input type="range" min="0" max="100" value={props.durationSliderPosition}  onChange={props.changeDuration} ref={props.durationSlider} />
                    <p className='duration--display'>{ getDurationInMinutes(props.currentPlayingTime) } / {getDurationInMinutes(props.fullDuration)}</p>
                </div>
            </div>
        </div>
    )
}