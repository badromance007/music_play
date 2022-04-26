export default function Visualyzer(props) {
    return (
        <div className="visualizer-box">
            <p>Visualyzer</p>
            <div className="visualizer-container">
                <div className="visualizer" ref={props.visualyzer}>
                    <div className="visualizer--innercircle">
                    </div>
                </div>
            </div>
        </div>
    )
}