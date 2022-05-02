import ModalToggler from "./ModalToggler";
import Modal from "./Modal";
import { useEffect, useRef, useState } from "react";
import { truncateString } from '../helpers/functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function ListPlaylistsButton(props) {
    const [targetingPlaylistId, setTargetingPlaylistId] = useState('')
    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false)

    const defaultFormData = useRef({
        playlistName: ''
    })
    const [formData, setFormData] = useState(defaultFormData.current)

    function handleFormChange(event) {
        const { name, value } = event.target
        setFormData(prevData => (
          {
            ...prevData,
            [name]: value
          }
        ))
    }

    function preventPropagation(event) {
        event.stopPropagation()
    }

    function updatePlaylistName(event, playlistId) {
        event.preventDefault()
    
        if (formData.playlistName.trim().length) {
          props.setAllPlaylists(oldPlaylists => oldPlaylists.map(oldPlaylist => (
            oldPlaylist.id === playlistId ?
            {
              ...oldPlaylist,
              name: formData.playlistName
            } :
            oldPlaylist
          )))
          // errorMessage.current.innerHTML = "<span style='color: green'>Playlist <strong>" + 
          //   formData.playlistName + "</strong> has been created successfully!</span>"
    
          setIsEditingPlaylist(false)
        } else {
          // errorMessage.current.innerHTML = "<span style='color: red'>Please enter a playlist name.</span>"
        }
    }

    function editPlaylist(event, playlist) {
        event.stopPropagation()
    
        if (playlist.id !== props.currentPlaylist.id) {
          setIsEditingPlaylist(prevState => !prevState)
          setTargetingPlaylistId(playlist.id)
    
          setFormData(prevFormData => ({
            ...prevFormData,
            playlistName: playlist.name
          }))
        }
    }

    function deletePlaylist(event, playlist) {
        event.stopPropagation()
    
        if (playlist.id !== props.currentPlaylist.id)
          props.setAllPlaylists(oldPlaylists => oldPlaylists.filter(oldPlaylist => oldPlaylist.id !== playlist.id))
    }

    useEffect(() => {
        if (!isEditingPlaylist) {
          // reset form
          setFormData(defaultFormData.current)
        }
    }, [isEditingPlaylist])

    useEffect(() => {
        setIsEditingPlaylist(false)
    }, [props.currentPlaylist.id])

    return (
        <ModalToggler
            defaultOnValue={false}
            setIsEditingPlaylist={setIsEditingPlaylist}
            render={({on, openModal, closeModal}) => {
                return (
                    <div>
                        <button onClick={openModal}>
                            {props.children}
                        </button>

                        {
                            on &&
                            <Modal
                                title="Choose a playlist to play"
                                closeModal={closeModal}
                            >
                                <div className='modal--body_playlist-container'>
                                    {
                                        props.allPlaylists.map(playlist => {
                                            return <div
                                                key={playlist.id}
                                                className={`modal--body_playlist ${props.currentPlaylist.id === playlist.id ? 'bg-purple' : ''}`}
                                                onClick={() => props.switchPlaylist(playlist.id)}
                                            >   
                                                {
                                                    (isEditingPlaylist && playlist.id === targetingPlaylistId)
                                                    ?
                                                    <form onSubmit={(event, playlistId) => updatePlaylistName(event, playlist.id)}>
                                                        <input
                                                            type="text"
                                                            name="playlistName"
                                                            placeholder="Playlist name"
                                                            autoComplete="off"
                                                            value={formData.playlistName}
                                                            onChange={handleFormChange}
                                                            onClick={(event) => preventPropagation(event)}
                                                        />
                                                        <button onClick={(event) => preventPropagation(event)}>Update</button>
                                                    </form>
                                                    :
                                                    <span>
                                                        {truncateString(playlist.name, 80)}
                                                    </span>
                                                }
                                                <div>
                                                    {
                                                        (props.currentPlaylist.id !== playlist.id && playlist.id !== props.allPlaylists[0].id) &&
                                                        <>
                                                            <span
                                                                onClick={(event) => editPlaylist(event, playlist)}
                                                            >
                                                                <FontAwesomeIcon icon="fa-solid fa-pen-to-square" />
                                                            </span>
                                                            <span
                                                                onClick={(event) => deletePlaylist(event, playlist)}
                                                            >
                                                                <FontAwesomeIcon icon="fa-solid fa-trash-can" />
                                                            </span>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                            </Modal>
                        }
                    </div>
                )
        }}/>
    )
}