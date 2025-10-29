import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import logo from './logo.svg';
import './TickerPicker.css';
import NavBar from './NavBar.js'
import Filter from './Filter.js'
import Screener from './Screener.js'

function Header({screen}) {
  return (
    <div className="App-Header">
      <img className="logo" src={logo} alt=""></img>
      <input type="text" placeholder="Search ticker or company"></input>
      <h1 className="brandText">{screen}</h1>
      <h2>Profile</h2>
    </div>
  )
}

function TickerPicker() {
  return (
    <div className="App">
      {/* 1. horizontal bar */}
      <Header screen="Ticker Picker"/>

      {/* 2. a. nav-bar, b. filter, c. screener */}
      <main className="App-Main">
        <NavBar />
        <Filter />  
        <Screener />
      </main>
    </div>
  );
}

export default TickerPicker;
