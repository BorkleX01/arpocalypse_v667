import React,  { Component } from 'react'
import Spinner from '../Widgets/Spinner'

class Transport extends Component{
  constructor(props){
    super();
    this.state = {
      timer: 0,
      isPlaying: false,
      timers : 0,
      autoStart: false,
      elapsed: 0,
      seqType: props.type,
      tempoMultiplier: 1,
      playFreq: 4,
      repeats: 1,
      ingress: [''],
      egress: [''],
      scheduleRestart : false,
      seq: [],
      cue: []
    }

    this.props = props
    
    var seqTimerBuffer = [];
    var rtTimerBuffer = [];
    var startTime = 0;

    
    this.startSequencer = () => {
      let period = 60000/this.props.tempo/this.state.tempoMultiplier;
      this.setState({scheduleRestart: false})
      let seqTimer = setInterval(() => {
        if(seqTimerBuffer.indexOf(seqTimer) === -1) seqTimerBuffer.push(seqTimer);
        this.state.seqType === 'realtime' ? !this.state.isPlaying ? playRT() : ()=>{} : procNotes();
        this.setState({timers : seqTimerBuffer.length, timer: startTime, isPlaying: true})
      }, +period)
    }
    
    var playRT = () => {
      this.props.cue.map(( o, i) => {
        let period = i > 0 ? o/this.state.tempoMultiplier : 0;
        let rtTimer = setTimeout(()=>{
          if(rtTimerBuffer.indexOf(rtTimer) === -1) rtTimerBuffer.push(rtTimer)
          procNotes();
          if(startTime ===  Object.keys(this.props.seq).length){
            this.setState({isPlaying: false});
            this.stopSequencer()
            startTime = 0;
          }
          this.setState({timers : rtTimerBuffer.length + seqTimerBuffer.length, timer: startTime});
        }, period)
      })
      this.setState({isPlaying: true});
      
    }
    
    var procNotes = () => {
      if (startTime >= Object.keys(this.props.seq).length ){startTime = 0}
      this.setState({timer: startTime})
      this.props.tick(this.state.timer)
      if(this.props.seq[startTime] != undefined){
        this.props.play(this.props.seq[startTime])
        startTime = startTime+1;
      }
    }
 
    this.stopSequencer = () => {
      while(seqTimerBuffer.length > 0){clearInterval(seqTimerBuffer.pop(seqTimerBuffer))}
      while(rtTimerBuffer.length > 0){clearTimeout(rtTimerBuffer.pop(rtTimerBuffer))}
      this.setState({isPlaying: false, timers : seqTimerBuffer.length + rtTimerBuffer.length})
    }
    

    this.doToNote = (e ,o) => {
      props.delete(o.value)
    }

    this.tempoMultiplier = (v) => {
      this.stopSequencer()
      let val = +v
      this.setState({scheduleRestart: this.state.isPlaying, tempoMultiplier: val})
    }

    this.changePlayFreq = (v) => {
      let val = +v
      this.setState({playFreq: val})
    }

    this.changePlayRepeats = (v) => {
      let val = +v
      this.setState({repeats: val})
    }
  }

  componentDidUpdate(){
    if (this.state.scheduleRestart){this.startSequencer()}
  }

  componentWillReceiveProps(newProps){
    if(newProps.start !== this.props.start){
      this.state.isPlaying ? this.stopSequencer() : this.startSequencer()
    }

    if(newProps.tempo !== this.props.tempo){
      this.tempoMultiplier(this.state.tempoMultiplier)
    }
  }
  render(){
    return(<div className='panel'>

             <button onClick={this.state.isPlaying ? this.stopSequencer : this.startSequencer}>
               {this.state.isPlaying ? 'PLAYING' : 'PLAY'} (SPC)
             </button>

             <div className="pane">
               <Spinner slider={false} label='Speed' min='1' max="16" value={this.state.tempoMultiplier} onChange={this.tempoMultiplier} step={1} /><br/>
             </div>
             <div className="pane">
               <Spinner slider={false} label='Frequency' min='1' max="16" value={this.state.playFreq} onChange={this.changePlayFreq} step={1} /><br/>
             </div>
             <div className="pane">
               <Spinner slider={false} label='Repeats' min='1' max="16" value={this.state.repeats} onChange={this.changePlayRepeats} step={1} /><br/>
             </div>
             <div className='read-outs'>
               <div className="label">Tempo: </div><div className="figures">{this.props.tempo}</div>
               <div className="label">Spawned: </div><div className="figures">{this.state.timers}</div>
               <div className="label">StepNo.: </div><div className="figures">{this.state.timer}</div>
             </div>
           </div>)
          
  }
}

export {Transport}
