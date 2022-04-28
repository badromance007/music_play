import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ninjaCat from '../images/ninja_cat_cool.png';

export default function Modal({allPlaylists, setCurrentPlaylistId, closeModal}) {
    const playListNameElements =  allPlaylists.map(playlist => {
                                    return <p
                                        key={playlist.id}
                                        onClick={() => setCurrentPlaylistId(playlist.id)}
                                    >{playlist.name}</p>
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