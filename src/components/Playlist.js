import Song from "./Song"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { truncateString } from '../helpers/functions';
import CreatePlaylistButton from "./CreatePlaylistButton";

export default function Playlist({
    songs,
    currentIndex,
    playThisSong,
    openPlaylistModal,
    openAddSongToPlaylistModal,
    currentPlaylist,
    moveSongToTopList,
    allPlaylists,
    deleteThisSong,
    setAllPlaylists
}) {
    const songElements = songs.map((song, songIndex) => (
        songs.length > 0 && <Song
            key={song.id}
            className={song.id === songs[currentIndex].id ? 'bg-blue' : ''}
            song={song}
            playThisSong={() => playThisSong(songIndex)}
            moveSongToTopList={moveSongToTopList}
            currentPlaylist={currentPlaylist()}
            allPlaylists={allPlaylists}
            deleteThisSong={deleteThisSong}
        />
    ))

    const playList = currentPlaylist()

    return (
        <div className="playlist">
            <div className="playlist--header">
                <div className="playlist--header_title">
                    <h1>{truncateString(playList.name, 45)}</h1>
                </div>
                <div className="playlist--header_actions">
                    <CreatePlaylistButton setAllPlaylists={setAllPlaylists}>
                        <span><FontAwesomeIcon icon="fa-solid fa-circle-plus" /></span>
                        <span>playlist</span>
                    </CreatePlaylistButton>
                    <div>
                        <button onClick={openAddSongToPlaylistModal}>
                            <span><FontAwesomeIcon icon="fa-solid fa-circle-plus" /></span>
                            <span><FontAwesomeIcon icon="fa-solid fa-music" /></span>
                        </button>
                    </div>
                    <div>
                        <button onClick={openPlaylistModal}>
                            <span><FontAwesomeIcon icon="fa-solid fa-headphones-simple" /></span>
                            <span>playlists</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="playlist--body">
                {songElements}
                {
                    !songElements.length &&
                    <p style={{padding: '20px', textAlign: 'center'}}>(This playlist has no songs. Click the button above to add songs.)</p>
                }
            </div>
        </div>
    )
}