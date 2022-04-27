import Song from "./Song"

export default function Playlist({ songs, currentIndex, playThisSong, openModal }) {
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
                <button onClick={openModal}>Create your own playlist</button>
                <h1>Default Playlist</h1>
            </div>
            {songElements}
        </div>
    )
}