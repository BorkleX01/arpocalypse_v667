import React, { Component } from 'react'
import './Engine.css'
import { EngineContext } from './EngineContext'
import { Keyboard } from '../Keyboard';
import Spinner from '../Widgets/Spinner'

class Engine extends Component {
  constructor(props) {
    super()
    this.state = {
      gain : 0.05,
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
        !isNaN(id) ? this.setState({noteOn: [id, 'note-on']}) : ()=>{};
	let g = 0.6/Math.pow(10, (+id-60)/36)
        let gainNode = audioCtx.createGain();
	gainNode.gain.value = g;
        gainNode.connect(this.gainNodeMaster)
        //gainNode.connect(audioCtx.destination, 0)
        let osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.linearRampToValueAtTime(hz, audioCtx.currentTime);
        osc.connect(gainNode);
        osc.start();
        gainNode.gain.exponentialRampToValueAtTime(g, audioCtx.currentTime);
        let sus =  Number(this.state.sustain);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + Number(sus));
        osc.stop(audioCtx.currentTime + sus);
        osc.onended = () => {!isNaN(id) ? this.setState({noteOn: [id, 'note-off']}) : ()=>{}}
      }
    }

    this.state.playNote = this.createOsc

    this.slideTempo = (v) => {
      let val = +v;
      this.setState({tempo : val})
    }
    
    this.slideGain = (v) => {
      let val = +v
      this.gainNodeMaster.gain.exponentialRampToValueAtTime(val, audioCtx.currentTime)
      this.setState({gain : val})
    }
    
    this.slideSustain = (v) => {
      let val = +v;
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
        <div className='engine'>
          <div className='ins-header' onClick={this.engineHeaderClick}>ARPOCALYPSE v.0.6.6.8 </div>
          <div className="ins" style={{display: this.state.panelVis ? 'block':'none' }}>
            <div className='panel' >
              <div className='pane'>
                <Spinner
                  label='Tempo'
                  type="number"
                  min='0' max="400"
                  value={this.state.tempo}
                  onChange={this.slideTempo}
                  step='1' />
              </div>

              <div className='pane'>
                <Spinner
                  label='Gain'
                  type="range"
                  min="0.01" max="1"
                  value={this.state.gain}
                  className="slider"
                  onChange={this.slideGain}
                  step='0.1'/>
              </div>

              <div className='pane'>
                <Spinner
                  label='Sustain'
                  type="range"
                  min="0.01" max="3"
                  value={this.state.sustain}
                  className="slider"
                  onChange={this.slideSustain}
                  step='0.1'/>
              </div>
              <button onClick={this.startEngine}>Engine {this.state.engineOn ? 'On' : 'Off' }</button>
            </div>
          </div>
        </div>
        {this.props.children}
      </EngineContext.Provider>
    )
  }
}
export default Engine
