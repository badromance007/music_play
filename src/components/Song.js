import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Song({song, className, playThisSong, moveSongToTopList, currentPlaylist, allPlaylists, deleteThisSong}) {
    return (
        <div
            className={`playlist--song ${className}`}
            onClick={playThisSong}
        >
            <div className="playlist--song_info">
                <img className="playlist--song_img" src={song.img} width="40" />
                <span className="playlist--song_title">{song.name}</span>
                <span className="playlist--song_singer">{song.singer}</span>
            </div>

            <div className="playlist--song_album">
                <span className='playlist--song_album__name'>{song.album}</span>
                <div>
                    <span onClick={(event, currentSong) => moveSongToTopList(event, song)}>
                        <FontAwesomeIcon icon="fa-solid fa-arrow-up-short-wide" />
                    </span>

                    {
                        currentPlaylist.id !== allPlaylists[0].id &&
                        <span onClick={(event, currentSong) => deleteThisSong(event, song)}>
                            <FontAwesomeIcon icon="fa-solid fa-trash-can" />
                        </span>
                    }
                </div>
            </div>
        </div>
    )
}