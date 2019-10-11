import React from 'react';
import logo from './logo.svg';
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
        <h1>Sudoku</h1>
        <Sudoku />
        <footer>&copy; 2015 Jiacheng Jiang</footer>
      </div>
    );
  }
}

export default App;
