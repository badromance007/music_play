import { useEffect, useState } from "react"

export default function ModalToggler(props) {
    const [on, setOn] = useState(props.defaultOnValue)

    function openModal() {
        setOn(true)
    }

    function closeModal() {
        document.querySelector('#modal-container').classList.add('out')
        document.querySelector('body').classList.remove('modal-active');
        setTimeout(() => {
            setOn(false)
        }, 500)
    }

    useEffect(() => {
        if (on) {
          document.querySelector('#modal-container').removeAttribute('class')
          document.querySelector('#modal-container').classList.add('fast')
          document.querySelector('body').classList.add('modal-active')
        }
    }, [on])
    
    return (
        props.render({
            on: on,
            openModal: openModal,
            closeModal: closeModal
        })
    )
}

// set default value for props
ModalToggler.defaultProps = {
    defaultOnValue: false
}