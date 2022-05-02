import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ninjaCat from '../images/ninja_cat_cool.png';

export default function Modal1(props) {
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
                                onClick={props.closeModal}
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