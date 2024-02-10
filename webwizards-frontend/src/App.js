import './App.css';
import TimelinePage from './pages/timeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBell, faHeart, faUser, faComment } from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <div className="App">
      <header className="top-nav">
          <h1 className="header-title">SocialDistribution</h1>
          <nav>
              <button className="nav-button">
                  <FontAwesomeIcon icon={faBell} />
              </button>
              <button className="nav-button">
                  <FontAwesomeIcon icon={faUser} />
              </button>
          </nav>
        </header>
        <TimelinePage/>
    </div>
  );
}

export default App;
