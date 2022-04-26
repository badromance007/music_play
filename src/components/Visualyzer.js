export default function Visualyzer(props) {
    return (
        <div className="visualizer-box">
            <p>Visualyzer</p>
            <div className="visualizer-container">
                <div className={`visualizer ${[!props.isPlaying && 'hidden']}`} ref={props.visualyzer}>
                    <div className="visualizer--innercircle">
                    </div>
                </div>
            </div>
        </div>
    )
}