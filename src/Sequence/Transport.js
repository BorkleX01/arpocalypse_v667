import React,  { Component } from 'react'
import Spinner from '../Widgets/Spinner'
import { EngineContext } from '../Engine/EngineContext'

class Transport extends Component{
  constructor(props){
    super();
    this.props = props
    this.state = {
      timer: 0,
      isPlaying: false,
      timers : 0,
      autoStart: false,
      elapsed: 0,
      seqType: props.type,
      tempoMultiplier: 2,
      playFreq: 4,
      repeats: 1,
      ingress: [''],
      egress: [''],
      scheduleRestart : false,
      scheduleStop: false,
      scheduleStart: false,
      seq: [],
      cue: [],
      realtime : false,
      multiplierAdjust: 'function',
      conseq: false,
      //module: this.props.module
      noteOn: 't-note-off',
      preservePos: true,
      deletion: true
    }

    
    
    var seqTimerBuffer = [];
    var rtTimerBuffer = [];
    this.startTime = 0;
    var freqCount = 0;

    
    this.startSequencer = () => {
      if(this.props.type === 'realtime'){
        this.playRT()
      }
      else
      {
        let period = 60000/this.props.tempo/this.state.tempoMultiplier;
        this.setState({scheduleRestart: false})
        let seqTimer = setInterval(() => {
          if(seqTimerBuffer.indexOf(seqTimer) === -1) seqTimerBuffer.push(seqTimer);
          playStep();
          this.setState({timers : seqTimerBuffer.length, timer: this.startTime, isPlaying: true})
        }, +period)
      }
    }
    
    this.playRT = () => {
      this.props.cue.map(( o, i) => {
        let period = i > 0 ? o/this.state.tempoMultiplier : 0;
        let rtTimer = setTimeout(()=>{
          if(rtTimerBuffer.indexOf(rtTimer) === -1) rtTimerBuffer.push(rtTimer)
          playStep();
          if(this.startTime ===  Object.keys(this.props.seq).length){
            this.setState({isPlaying: false});
            this.stopSequencer()
            this.startTime = 0;
          }
          this.setState({timers : rtTimerBuffer.length + seqTimerBuffer.length, timer: this.startTime});
        }, period)
      })
      this.setState({isPlaying: true});
    }
    
    var playStep = () => {

      if (this.startTime >= Object.keys(this.props.seq).length ){this.startTime = 0}
      if (freqCount >= this.state.playFreq ){freqCount = 0}

      this.setState({timer: this.startTime})
      this.props.tick(this.state.timer)

      if(this.props.seq[this.startTime] != undefined){
        this.props.play(this.props.seq[this.startTime])
        this.startTime = this.startTime+1;
        freqCount = freqCount + 1;
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
      let val = +v
      this.setState({scheduleRestart: this.state.isPlaying, tempoMultiplier: val})
      this.stopSequencer()
      this.props.clipListener(val, 'tempoX')

    }
    
    this.state.multiplierAdjust = this.tempoMultiplier;
    
    this.changePlayFreq = (v) => {
      let val = +v
      this.setState({playFreq: val})
    }

    this.changePlayRepeats = (v) => {
      let val = +v
      this.setState({repeats: val})
    }

    this.toggleRealTime = (e) => {
      this.setState({realTime: !this.state.realTime})
    }

    this.startFrom = () => {
      console.log('start from');
      console.log(this.startTime);
    }

    this.transportFunctions = (e) => {
      switch (e.target.id){
      case 'conseq':{
        this.setState({conseq: !this.state.conseq})
        break;
      }
      case 'preserve' :{
        this.setState({preservePos: !this.state.preservePos})
        break;
      }
        
      }
    }

    this.playNextClip = () => {
      this.props.playNextClip()
    }

    this.engSig = (sigStr) => {
      if (sigStr === 'stopAll'){
        if (!this.state.scheduleStop){
          this.stopSequencer()
          this.setState({scheduleStop : true })
          this.setState({scheduleStart : false })
        }
      }

      
      if (sigStr === 'playAll'){
        if (!this.state.scheduleStart){
          if(!this.state.isPlaying) {
            this.startSequencer() }
          else {
            this.stopSequencer() ;
            this.setState({scheduleRestart : true})
          }
          this.setState({scheduleStop : false })
          this.setState({scheduleStart : true })
        }
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapShot){
    if (this.state.scheduleRestart){
      this.startSequencer()
    }
    
    if(prevState.tempoMultiplier !== this.state.tempoMultiplier){
      this.tempoMultiplier(this.state.tempoMultiplier)
    }

    if ((this.state.conseq && (this.state.timer === this.props.seq.length))
        && this.state.isPlaying && this.state.timer > 0) {
      if(this.state.preservePos){
        this.startTime = 0;
        this.setState({timer: 0})
      }
      this.stopSequencer()
      this.setState({scheduleRestart: true })
      
      this.playNextClip()
    }
    
  }

  componentWillReceiveProps(newProps){
    if(newProps.start !== this.props.start){
      this.state.isPlaying ? this.stopSequencer() : this.startSequencer()
    }

    if(newProps.tempo !== this.props.tempo){
      this.tempoMultiplier(this.state.tempoMultiplier)
    }
  }

  componentDidMount(){
    this.tempoMultiplier(this.state.tempoMultiplier)
  }
  

  render(){
    return(<EngineContext.Consumer>
             {engine =>
              (<div className='panel'>
                 {engine.stopAll !== this.state.scheduleStop  && this.engSig('stopAll') } 
                 {engine.playAll !== this.state.scheduleStart  && this.engSig('playAll') }

                 <button
                   className={this.state.noteOn+' transport'}
                   onClick={this.state.isPlaying ? this.stopSequencer :  this.startSequencer}>
                   {this.state.isPlaying ? 'STOP' : 'PLAY'} CLIP
                 </button>
                 <button id='conseq'
                         value={this.state.conseq}
                         onClick={this.transportFunctions}>
                   PLAY CONSEQ ({this.state.conseq ? 'ON':'OFF'})
                 </button>
                 <button id='deletion'
                         value={this.state.deletion}
                         onClick={this.transportFunctions}>
                   DELETE NOTES ({this.state.deletion ? 'ON':'OFF'})
                 </button>
                 <button id='startFrom'
                         onClick={this.transportFunctions} >
                   START FROM
                 </button>
                 <button id='preserve'
                         value={this.state.preservePos}
                         onClick={this.transportFunctions}>
                   PRESERVE POS ({this.state.preservePos ? 'ON':'OFF'})
                 </button>
                 <button>REST</button>
                 <button>SPLIT</button>
                 <button>TIE</button>
                 <button>COPY/MOVE</button>
                 <button>INSERT</button>
                 <div className="panel dial-group">
                   <div className="pane">
                     <Spinner id='speed-dial' slider={false} label='Speed' min='1' max="16" value={this.state.tempoMultiplier} onChange={this.tempoMultiplier} step={1} /><br/>
                   </div>
                   <div className="pane">
                     <Spinner slider={false} label='Frequency' min='1' max="16" value={this.state.playFreq} onChange={this.changePlayFreq} step={1} /><br/>
                   </div>
                   <div className="pane">
                     <Spinner slider={false} label='Repeats' min='1' max="16" value={this.state.repeats} onChange={this.changePlayRepeats} step={1} /><br/>
                   </div>
                 </div>
                 <div className='panel read-outs'>
                   <div className="label">Tempo: </div><div className="figures">{this.props.tempo}</div>
                   <div className="label">Spawned: </div><div className="figures">{this.state.timers}</div>
                   <div className="label">StepNo.: </div><div className="figures">{this.state.timer} of {this.props.seq.length}</div>
                 </div>
                 <div className="messages"></div>
               </div>)}
           </EngineContext.Consumer>)
    
  }
}

export {Transport}
