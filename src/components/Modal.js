import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ninjaCat from '../images/ninja_cat_cool.png';

export default function Modal(props) {
    function closeModal() {
        document.querySelector('#modal-container').classList.add('out')
        document.querySelector('body').classList.remove('modal-active');
        setTimeout(() => {
            props.setIsPlaylistModalShow(false)
            props.setIsAddSongToPlaylistModalShow(false)
            props.setIsCreatePlaylistModalShow(false)
        }, 500)

        props.setIsEditingPlaylist(false)
    }

    return (
        <div id="modal-container">
            <div className="modal-background">
                <div className="modal">
                    <div className='modal--wrapper'>
                        <div className='modal--header'>
                            <div>
                                <h3>{props.title}</h3>
                            </div>
                            <span
                                className='modal--header_close'
                                onClick={closeModal}
                            >
                                <FontAwesomeIcon icon="fa-solid fa-rectangle-xmark" />
                            </span>
                        </div>
                        <div className='modal--body'>
                            {props.children}
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