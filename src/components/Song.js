export default function Song({song, className, playThisSong}) {
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
                <span>{song.album}</span>
            </div>
        </div>
    )
}