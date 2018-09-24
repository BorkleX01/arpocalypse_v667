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
      panelVis: false,
      config: {},
      message : ''
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

    this.saveInstrument = (ins) => {
      //console.log(ins.instrument +'  '+ ins.clips.length)
      let inst = ins.instrument

      if (this.state.config[inst] == undefined){
        this.setState({config : {...this.state.config,  [inst] : ins.clips != undefined ? ins.clips : [] } } )
      }
      if (ins.clips.length > 0)
      {
        if (ins.clips.length !== this.state.config[inst].length) { this.setState({config : {...this.state.config , [inst] :  ins.clips }})}  
      }
    }

    this.saveConfig = () => {
      console.log('server storage');
      
      var config = {}
      config.instruments = this.state.config
      config.tempo = this.state.tempo
      config.sustain = this.state.sustain
      config.gain = this.state.gain

      var storageServer = process.env.NODE_ENV === "development" ? 'http://lunatropolis.com/arp-save.php' : '../arp-save.php';
      let req = new XMLHttpRequest();
      let fData = new FormData();
      fData.set('action', 'write')
      fData.set('config', JSON.stringify(config))
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

    this.state.saveIns = this.saveInstrument

    this.loadConfig = () => {
      var storageServer = process.env.NODE_ENV === "development" ? 'http://lunatropolis.com/arp-save.php' : '../arp-save.php';
      let req = new XMLHttpRequest();
      let fData = new FormData();
      fData.set('action', 'read')
      req.open('POST', storageServer, true);
      let callBack = (obj) => {
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
          <div id='headerOp' className='ins-header'
               onClick={this.engineHeaderClick}>ARPOCALYPSE v.0.6.6.8
            <div style={{display: 'inline-block'}} className={`blinker ${this.state.noteOn[1]}`}>{' '}</div>
            <div className="legals">© 2018 Eugene Phang</div>
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
                <button onClick={this.startEngine}>Engine {this.state.engineOn ? 'On' : 'Off' }  </button>
                <button onClick={this.saveConfig}>SAVE CONFIG</button>
                <button onClick={this.loadConfig}>LOAD CONFIG</button>
                <div className="label">{this.state.message}</div>
                <div className="panel read-outs">
                  <div className="label">Instruments: </div>
                  <div className="figures">{Object.keys(this.state.config).join(', ')}</div>
                  {Object.entries(this.state.config).map((o, i)=> <div key={i} className="label"> {o[0]} {o[1].length}</div> )}
                  <div className="label">Tempo:</div>
                  <div className="figures">{this.state.tempo}</div>
                </div>
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
