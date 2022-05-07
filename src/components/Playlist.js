import Song from "./Song"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { truncateString } from '../helpers/functions';
import CreatePlaylistButton from "./CreatePlaylistButton";
import AddSongToPlaylistButton from "./AddSongToPlaylistButton";
import ListPlaylistsButton from "./ListPlaylistsButton";
import { SongContext } from "../contexts/SongContext";
import { useContext } from "react";

export default function Playlist() {

    const {
        songs,
        currentIndex,
        playThisSong,
        openPlaylistModal,
        currentPlaylist,
        moveSongToTopList,
        allPlaylists,
        deleteThisSong,
        setAllPlaylists,
        songsData,
        addSongToPlaylist,
        switchPlaylist
    } = useContext(SongContext)

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

                    <AddSongToPlaylistButton
                        currentPlaylist={currentPlaylist()}
                        songsData={songsData}
                        addSongToPlaylist={addSongToPlaylist}
                    >
                        <span><FontAwesomeIcon icon="fa-solid fa-circle-plus" /></span>
                        <span><FontAwesomeIcon icon="fa-solid fa-music" /></span>
                    </AddSongToPlaylistButton>

                    <ListPlaylistsButton
                        allPlaylists={allPlaylists}
                        currentPlaylist={currentPlaylist()}
                        switchPlaylist={switchPlaylist}
                        setAllPlaylists={setAllPlaylists}
                    >
                        <span><FontAwesomeIcon icon="fa-solid fa-headphones-simple" /></span>
                        <span>playlists</span>
                    </ListPlaylistsButton>
                </div>
            </div>
            <div className="playlist--body hide-scrollbar">
                {songElements}
                {
                    !songElements.length &&
                    <p style={{padding: '20px', textAlign: 'center'}}>(This playlist has no songs. Click the button above to add songs.)</p>
                }
            </div>
        </div>
    )
}