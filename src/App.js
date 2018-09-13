import React, { Component } from 'react';
import './App.css';
import { Engine } from './Engine';
import { Keyboard } from './Keyboard';

class App extends Component {
  render() {
    
    return (
      //if (!this.state.val) return
      <div className="App">
        <Engine>
          <Keyboard range={[24,95]} />
        </Engine>
        
      </div>
    );
  }
}

export default App;
