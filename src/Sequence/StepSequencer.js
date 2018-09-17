import React,  { Component } from 'react'


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
      startTime = 0;
      this.setState({scheduleRestart: false})
      let seqTimer = setInterval(() => {
        if(seqTimerBuffer.indexOf(seqTimer) === -1) seqTimerBuffer.push(seqTimer);
        this.state.seqType === 'realtime' ? !this.state.isPlaying ? playRT() : console.log('trigger') : procNotes();
        this.setState({timers : seqTimerBuffer.length, timer: startTime, isPlaying: true})
      }, 60000/this.props.tempo/this.state.tempoMultiplier)
    }
    
    var playRT = () => {
      this.props.cue.map(( o, i) => {
        let rtTimer = setTimeout(()=>{
          if(rtTimerBuffer.indexOf(rtTimer) === -1) rtTimerBuffer.push(rtTimer)
          procNotes();
          if(startTime ===  Object.keys(this.props.seq).length){
            this.setState({isPlaying: false});
            this.stopSequencer()
            startTime = 0;
          }
          this.setState({timers : rtTimerBuffer.length + seqTimerBuffer.length, timer: startTime});
        }, i > 0 ? o/this.state.tempoMultiplier : 0)
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

    this.tempoMultiplier = (e) => {
      this.stopSequencer()
      let val = +e.target.value
      this.setState({scheduleRestart: this.state.isPlaying, tempoMultiplier: val})
    }

  }
  componentDidUpdate(){
    if (this.state.scheduleRestart){this.startSequencer()}
  }
  render(){
    return(<div className='panel '>
           <button onClick={this.startSequencer}>START SEQ</button>
           <button onClick={this.stopSequencer}>STOP SEQ</button>
           <div className='read-outs'>
           Tempo: <input type="number" min='1' max="16" value={this.state.tempoMultiplier} className="slider" onChange={this.tempoMultiplier} step={1} /><br/>
           Spawned: {this.state.timers}<br/>
           StepNo.: {this.state.timer}<br/>
           </div>
           <div className='read-outs'>
           Frequency:<input type="number" min='1' max="16" value={this.state.tempoMultiplier} className="slider" onChange={this.tempoMultiplier} step={1} /><br/>
           Repeats:<input type="number" min='1' max="16" value={this.state.tempoMultiplier} className="slider" onChange={this.tempoMultiplier} step={1} /><br/>
           </div>
           </div>)
  }
}

export {Transport}
