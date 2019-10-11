import React from 'react';
import logo from './assets/s.png';
import './App.css';

import Sudoku from './sudoku';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {game: new Sudoku()};
  }
  render() {
    this.state ? console.table(this.state.game.table) : console.log("not ready");
    return (
      <div className="App">
        <h1><img src={logo} alt="S" className="App-logo" />udoku</h1>
        <Sudoku />
        <footer>&copy; 2019 Jiacheng Jiang</footer>
      </div>
    );
  }
}

export default App;
