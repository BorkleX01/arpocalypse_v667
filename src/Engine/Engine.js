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
      saveIns: 'No Function',
      noteOn: [],
      elapsed: 0,
      panelVis: true,
      config: {},
      message : '',
      playAll : true,
      stopAll: false
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

    this.stopEngine = () => {
      audioCtx.close()
      this.setState({engineOn: false})
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

    var saveData = {};
    this.saveInstrument = (ins) => {
      if (ins.clips.length > 0)
      { let inst = ins.instrument
        saveData = {
          ...saveData , instruments : { ...saveData.instruments, [inst] : { clips: ins.clips , clipSettings: ins.clipSettings }}
        }
        
      }
    }
    this.state.saveIns = this.saveInstrument
    
    this.saveConfig = () => {
      
      saveData.tempo = this.state.tempo
      saveData.sustain = this.state.sustain
      saveData.gain = this.state.gain

      console.log('Save config');
      console.log(saveData);
      
      var storageServer = process.env.NODE_ENV !== "development" ? 'http://lunatropolis.com/arp-save.php' : 'http://localhost/arp-save.php';
      console.log('server: ' +  storageServer);
      let req = new XMLHttpRequest();
      let fData = new FormData();
      fData.set('action', 'write')
      fData.set('config', JSON.stringify(saveData))
      req.open('POST', storageServer, true);
      //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      let callBack = () => {
        this.setState({message: 'Saved config'})
      }
      req.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          callBack()
        }
      }
      req.send(fData)

    }

    

    this.loadConfig = () => {
      var storageServer = process.env.NODE_ENV === "development" ? 'http://lunatropolis.com/arp-save.php' : '../arp-save.php';
      let req = new XMLHttpRequest();
      let fData = new FormData();
      fData.set('action', 'read')
      req.open('POST', storageServer, true);
      let callBack = (obj) => {
        console.log(obj);

        this.setState(state=>{

          state.message = 'Loaded config'
          state.tempo = obj.tempo
          state.sustain = obj.sustain
          state.gain = obj.gain
          state.config = obj.instruments

          console.log(state)

          return state})
      }
      req.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          let res = this.response;
          let obj = JSON.parse(res)
          callBack(obj)
        }
      }
      req.send(fData)
    }


    this.playAll = () => {
      this.setState({playAll : true, stopAll: false})
    }

    this.stopAll = () => {
      this.setState({playAll : false, stopAll: true})
    }
    
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

    
    this.engineHeaderClick = (e) => {
      if(e.target.id === 'headerOp'){
        this.setState({panelVis: !this.state.panelVis})
      }
    }

    
  }
  
  componentDidMount(){
    this.startEngine()
  }
  
  render() {
    return (
      <div className='engine'>
        <EngineContext.Provider value={this.state}>
          <div id='headerOp' className='app-title ins-header'
               onClick={this.engineHeaderClick}>ARPOCALYPSE v.0.6.6.8
            <div style={{display: 'inline-block'}} className={`blinker ${this.state.noteOn[1]}`}>{' '}</div>
            <div className="legals">© 2018 Eugene Phang</div>
          </div>
          <div className="global-ins" style={{display: this.state.panelVis ? 'block':'none' }}>
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
                <button onClick={!this.state.engineOn ? this.startEngine : this.stopEngine}>{!this.state.engineOn ? 'START' : 'STOP'} ENGINE </button>
                <button onClick={ !this.state.playAll ? this.playAll :  this.stopAll }> {!this.state.playAll ? 'PLAY' : 'STOP'} ALL </button>

                <button onClick={this.saveConfig}>SAVE CONFIG</button>
                <button onClick={this.loadConfig}>LOAD CONFIG</button>
                
                <div className="panel read-outs">
                  <div className="label">Instruments: </div>
                  <div className="figures">{Object.keys(this.state.config).join(', ')}</div>
                  {Object.entries(this.state.config).map((o, i)=> <div key={i} className="label"> {o[0]} {o[1].length}</div> )}
                  <div className="label">Tempo:</div>
                  <div className="figures">{this.state.tempo}</div>
                  <div className="label">{this.state.message}</div>
                </div>
              </div>
              
            </div>
          {this.props.children}
        </EngineContext.Provider>
        </div>
    )
  }
}
export default Engine
