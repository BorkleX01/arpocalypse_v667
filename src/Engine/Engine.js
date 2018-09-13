import React, { Component } from 'react'
import './Engine.css'
import { EngineContext } from './EngineContext'
import { Keyboard } from '../Keyboard';

class Engine extends Component {
  constructor(props) {
    super()
    this.state = {
      gain : 0.10,
      part: 1000,
      sustain: 3,
      tempo: 135,
      timer: 0,
      engineOn: false,
      isPlaying: false,
      playNote: '',
      noteOn: []
    }
    
    var audioCtx = false
    var gainNode = false

    this.startEngine = () => {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNodeMaster = audioCtx.createGain();
      this.gainNodeMaster.connect(audioCtx.destination, 0);
      this.gainNodeMaster.gain.exponentialRampToValueAtTime(+this.state.gain, audioCtx.currentTime);
      this.setState({engineOn: true})
    }
    
    this.createOsc = (id, hz) => {
      if(!isNaN(hz) ){
        !isNaN(id) ? this.setState({noteOn: [id, 'note-on']}) : console.log(id);
	let g = 0.3/Math.pow(10, (+id-60)/36)
        let gainNode = audioCtx.createGain();
	gainNode.gain.value=g;
        gainNode.connect(this.gainNodeMaster)
        let osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.linearRampToValueAtTime(hz, audioCtx.currentTime);
        osc.connect(gainNode);
        osc.start();
        gainNode.gain.exponentialRampToValueAtTime((+id>60)?g:1, audioCtx.currentTime);
        let sus =  Number(this.state.sustain);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + Number(sus));
        osc.stop(audioCtx.currentTime + sus);
        osc.onended = () => {!isNaN(id) ? this.setState({noteOn: [id, 'note-off']}) : console.log(id)}
      }
    }

    this.state.playNote = this.createOsc

    this.slideTempo = (e, o) => {
      let val = e.target.value;
      this.setState({tempo : val})
    }
    
    this.slideGain = (e, o) => {
      let val = e.target.value
      this.gainNodeMaster.gain.exponentialRampToValueAtTime(+val, audioCtx.currentTime)
      this.setState({gain : val})
    }
    this.slideSustain = (e, o) => {
      let val = e.target.value;
      this.setState({sustain : val})
    }
  }
  componentDidMount(){
    this.startEngine()
  }
  render() {
    return (
      <EngineContext.Provider value={this.state}>
        {this.props.children}
        <div className='engine'>
          <div className='panel' >
            <div className='control'>
              <button onClick={this.startEngine}>Engine {this.state.engineOn ? 'On' : 'Off' }</button>
            </div>
            <div className='control'>
              Tempo:
              <input type="number" min='0' max="400" value={this.state.tempo} className="input" onChange={this.slideTempo} step='1' />
              <input type="range" min='0' max="400" value={this.state.tempo} className="slider" onChange={this.slideTempo} step='1' />
            </div>
            <div className='control'>
              Gain: {this.state.gain}
              <input type="range" min="0.01" max="1" value={this.state.gain} className="slider" onChange={this.slideGain}  step='0.01'/>
            </div>
            <div className='control'>
              Sustain: {this.state.sustain}
              <input type="range" min="0.01" max="1" value={this.state.sustain} className="slider" onChange={this.slideSustain}  step='0.01'/>
            </div>
          </div>
        </div>
      </EngineContext.Provider>
    )
  }
}
export default Engine
