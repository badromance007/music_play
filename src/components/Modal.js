import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ninjaCat from '../images/ninja_cat_cool.png';
import { truncateString } from '../helpers/functions';

export default function Modal({allPlaylists, switchPlaylist, closeModal, currentPlaylistId}) {
    const playListNameElements =  allPlaylists.map(playlist => {
                                    return <div
                                        key={playlist.id}
                                        className={`modal--body_playlist ${currentPlaylistId === playlist.id ? 'bg-orange' : ''}`}
                                    >   
                                        <span onClick={() => switchPlaylist(playlist.id)}>
                                            {truncateString(playlist.name, 80)}
                                        </span>
                                    </div>
                                })
    return (
        <div id="modal-container">
            <div className="modal-background">
                <div className="modal">
                    <div className='modal--wrapper'>
                        <div className='modal--header'>
                            <span
                                className='modal--header_close'
                                onClick={closeModal}
                            >
                                <FontAwesomeIcon icon="fa-solid fa-rectangle-xmark" />
                            </span>
                        </div>
                        <div className='modal--body'>
                            {playListNameElements}
                        </div>
                        <div className='modal--footer'>
                            <img src={ninjaCat} width="100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}