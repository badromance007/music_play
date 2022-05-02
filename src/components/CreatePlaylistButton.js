import ModalToggler from "./ModalToggler";
import Modal from "./Modal";
import { useRef, useState } from "react";
import { nanoid } from 'nanoid';

export default function CreatePlaylistButton(props) {
    const defaultFormData = useRef({
        playlistName: ''
    })
    const [formData, setFormData] = useState(defaultFormData.current)
    const errorMessage = useRef()

    function handleFormChange(event) {
        const { name, value } = event.target
        setFormData(prevData => (
          {
            ...prevData,
            [name]: value
          }
        ))
    }

    function createNewPlaylist(event) {
        event.preventDefault()

        if (formData.playlistName.trim().length) {
            props.setAllPlaylists(prevPlaylists => {
                return [
                    ...prevPlaylists,
                    {
                        id: nanoid(),
                        name: formData.playlistName,
                        songs: []
                    }
                ]
            })
            errorMessage.current.innerHTML = "<span style='color: green'>Playlist <strong>" + 
                formData.playlistName + "</strong> has been created successfully!</span>"
        } else {
            errorMessage.current.innerHTML = "<span style='color: red'>Please enter a playlist name.</span>"
        }

        // reset form
        setFormData(defaultFormData.current)
    }

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
                            title="Create new playlist"
                            closeModal={closeModal}
                        >
                            <div className='modal--body_form-container'>
                                <div ref={errorMessage}></div>
                                <form onSubmit={(event) => createNewPlaylist(event)}>
                                    <input
                                        type="text"
                                        name="playlistName"
                                        placeholder="Playlist name"
                                        autoComplete="off"
                                        value={formData.playlistName}
                                        onChange={handleFormChange}
                                    />
                                    <button>Create</button>
                                </form>
                            </div>
                        </Modal>
                    }
                </div>
            )
        }}/>
    )
}