import './NavBar.css'
import logo from './logo.svg'

let screens = ["Home", "Ticker Picker", "My Watchlist", "Profile"];
let screensMenu = screens.map( screen => 
    <div>
    <li key={screen}>
        <img className="icon" src={logo} alt="icon" />
        <span>{screen}</span>
    </li>
    </div>
);

const NavBar = () => {
  return (
    <div>
    <div id="NavBar-Container" className="Container">
        <ul id="NavBar">{screensMenu}</ul>
    </div>
    </div>
  )
};

export default NavBar