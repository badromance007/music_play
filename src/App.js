import './App.css';
import Mp3Player from './components/Mp3Player';
import Playlist from './components/Playlist';

function App() {
    return (
        <main>
            <Playlist />
            <br />
            <Mp3Player />
        </main>
    );
}

export default App;
