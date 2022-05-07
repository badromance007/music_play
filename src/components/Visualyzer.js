import { useContext, useEffect, useRef } from "react"
import { SongContext } from '../contexts/SongContext';
import { clamp } from '../helpers/functions';

export default function Visualyzer() {
    const visualyzer = useRef()
    const audioContext = useRef()
    const audioSource = useRef()

    const {track, isPlaying} = useContext(SongContext)

    function createVisualyzer() {
        audioContext.current = audioContext.current || new AudioContext()
        audioSource.current = audioSource.current || audioContext.current.createMediaElementSource(track.current)
        const analyser = audioContext.current.createAnalyser();

        audioSource.current.connect(analyser)
        analyser.connect(audioContext.current.destination)
        analyser.fftSize = 64

        const bufferLength = analyser.frequencyBinCount
        let dataArray = new Uint8Array(bufferLength)

        let elements = []
        for(let i = 0; i < bufferLength; i++) {
            const element = document.createElement('span')
            element.classList.add('visualyzer--element')
            elements.push(element)
            visualyzer.current.appendChild(element)
        }

        function animate() {
            requestAnimationFrame(animate)
            analyser.getByteFrequencyData(dataArray)

            for(let i = 0; i < bufferLength; i++) {
                let item = dataArray[i]
                item = item > 90 ? item / 3 : item * 1.95
                elements[i].style.transform = `rotateZ(${i * (360 / bufferLength)}deg) translate(-50%, ${clamp(item, 60, 90)}px)`
            }
        }

        animate()
    }

    useEffect(() => {
        if (isPlaying && !audioContext.current) {
            createVisualyzer();
        }
    }, [isPlaying])

    return (
        <div className="visualizer-box">
            <p>Visualyzer</p>
            <div className="visualizer-container">
                <div className={`visualizer ${[!isPlaying && 'hidden']}`} ref={visualyzer}>
                    <div className="visualizer--innercircle">
                    </div>
                </div>
            </div>
        </div>
    )
}