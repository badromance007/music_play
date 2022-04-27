import Song from "./Song"

export default function Playlist({ songs, currentIndex, playThisSong }) {
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
            <h1>Playlist</h1>
            {songElements}
        </div>
    )
}