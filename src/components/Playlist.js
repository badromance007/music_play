import Song from "./Song"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { truncateString } from '../helpers/functions';

export default function Playlist({ songs, currentIndex, playThisSong, openModal, currentPlaylist }) {
    const songElements = songs.map((song, songIndex) => (
        <Song
            key={song.id}
            className={song.id === songs[currentIndex].id ? 'bg-blue' : ''}
            song={song}
            playThisSong={() => playThisSong(songIndex)}
        />
    ))

    return (
        <div className="playlist">
            <div className="playlist--header">
                <div className="playlist--header_button-container">
                    <button>
                        <span><FontAwesomeIcon icon="fa-solid fa-circle-plus" /></span>
                        <span>playlist</span>
                    </button>
                </div>
                <div>
                    <h1>{truncateString(currentPlaylist.name, 16)}</h1>
                </div>
                <div>
                    <button onClick={openModal}>
                        <span><FontAwesomeIcon icon="fa-solid fa-headphones-simple" /></span>
                        <span>playlists</span>
                    </button>
                </div>
            </div>
            {songElements}
        </div>
    )
}