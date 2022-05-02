import ModalToggler from "./ModalToggler";
import Modal from "./Modal";
import { truncateString } from '../helpers/functions';

export default function AddSongToPlaylistButton(props) { 
    const remainingSongs = props.songsData.filter(oldSong => props.currentPlaylist.songs.every(song => oldSong.id !== song.id))
    const remainingSongsElements = remainingSongs.map(song => {
            return <div
                        key={song.id}
                        className={`modal--body_songs`}
                        onClick={() => props.addSongToPlaylist(song, props.currentPlaylist)}
                    >   
                        <span>
                            <img src={song.img} width="40" height="40" />
                        </span>
                        <span>
                            {truncateString((`${song.name} - ${song.singer}`), 80)}
                        </span>
                    </div>
    })

    return (
        <ModalToggler defaultOnValue={false} render={({on, openModal, closeModal}) => {
            return (
                <div>
                    <button onClick={openModal}>
                        {props.children}
                    </button>

                    {
                        on &&
                        <Modal
                            title={`Choose song to add to ${truncateString(props.currentPlaylist.name, 16)}`}
                            closeModal={closeModal}
                        >
                            <div className='modal--body_songs-container'>
                                {remainingSongsElements}
                                {!remainingSongsElements.length && <p style={{padding: '20px'}}>No more songs to add.</p>}
                            </div>
                        </Modal>
                    }
                </div>
            )
        }}/>
    )
}