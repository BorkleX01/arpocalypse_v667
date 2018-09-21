import React, { Component } from 'react'
import './Engine.css'
import { EngineContext } from './EngineContext'
import { Keyboard } from '../Keyboard';
import Spinner from '../Widgets/Spinner'

class Engine extends Component {
  constructor(props) {
    super()
    this.state = {
      gain : 0.10,
      part: 1000,
      sustain: 1,
      tempo: 135,
      timer: 0,
      engineOn: false,
      isPlaying: false,
      playNote: 'No Function',
      noteOn: [],
      elapsed: 0,
      panelVis: false
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
	let g = 0.6/Math.pow(10, (+id-60)/36)
        let gainNode = audioCtx.createGain();
	gainNode.gain.value=g;
        gainNode.connect(this.gainNodeMaster)
        let osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.linearRampToValueAtTime(hz, audioCtx.currentTime);
        osc.connect(gainNode);
        osc.start();
        gainNode.gain.exponentialRampToValueAtTime(g, audioCtx.currentTime);
        let sus =  Number(this.state.sustain);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + Number(sus));
        osc.stop(audioCtx.currentTime + sus);
        osc.onended = () => {!isNaN(id) ? this.setState({noteOn: [id, 'note-off']}) : console.log(id)}
      }
    }

    this.state.playNote = this.createOsc

    this.slideTempo = (v) => {
      let val = +v;
      console.log('Engine Tempo change: ' + val);
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

    this.requestElapsed = () => {
      console.log(this.state.elapsed);
    }
    this.engineHeaderClick = () => {
      this.setState({panelVis: !this.state.panelVis})
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
          <div className='key-inner ins-header' onClick={this.engineHeaderClick}>ENGINE</div>
          <div className='panel' style={{display: this.state.panelVis ? 'flex':'none' }} >
            <div className='pane'>
              <button onClick={this.startEngine}>Engine {this.state.engineOn ? 'On' : 'Off' }</button>
            </div>
            <div className='pane'>
              Tempo:
              <Spinner type="number" min='0' max="400" value={this.state.tempo} onChange={this.slideTempo} step='1' />
              
            </div>
            <div className='pane'>
              Gain: {this.state.gain}
              <Spinner type="range" min="0.01" max="1" value={this.state.gain} className="slider" onChange={this.slideGain}  step='0.01'/>
            </div>
            <div className='pane'>
              Sustain: {this.state.sustain}
              <Spinner type="range" min="0.01" max="3" value={this.state.sustain} className="slider" onChange={this.slideSustain}  step='0.01'/>
            </div>
          </div>
        </div>
      </EngineContext.Provider>
    )
  }
}
export default Engine
