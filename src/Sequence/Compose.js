import React,  { Component } from 'react'
import { EngineContext } from '../Engine/EngineContext'
class ComposeClips extends Component{
  constructor(props){
    super();
    this.state = {
      instrument : '',
      clips: [],
      clipSettings: [],
      arpSettings: {},
      deletion: false,
      chain: true
    }

    this.state.instrument = props.module;
    this.state.arpSettings = props.arpSettings;
    this.presetsLoaded = false;
    
    this.saveSeq = () => {
      if(this.props.seq){
        let clip = [];
        let thisSeq = this.props.seq;
        thisSeq.map((o,i)=>clip.push([this.props.seq[i], this.props.cue[i]]))
        this.setState(state => {
          state.clips = [...state.clips, clip]
          state.clipSettings = [...state.clipSettings , [this.props.recTempo , this.state.arpSettings.tempoX, this.state.clips.length-1,]]
          this.props.clipListener();
          return state })}}

    this.toggle = (e) => {
      switch (e.target.id) {
      case 'deletion': this.setState({deletion: !this.state.deletion})
        break;
      case 'chain': this.setState({chain: !this.state.chain})
        break;
      }
    }
    
    this.loadPresets = (bank) => {
      if( bank[this.state.instrument] != undefined) {
        this.presetsLoaded = true
        this.setState(state=>{
          state.clips = bank[this.state.instrument].clips
          state.clipSettings = bank[this.state.instrument].clipSettings
          this.props.clipListener() //replicates the clips to Role now 
          return state
        })}
    }

    this.loadSimple = (clips, clipSettings) => {

      this.setState(state=>{
          state.clips = clips
          state.clipSettings = clipSettings
          this.props.clipListener() //replicates the clips to Role now 
          return state
        })
    }
    
    this.clipLength = this.state.clips.length
    this.updateEngine = false
  }
  
  componentDidUpdate(){
    if(this.state.clips.length !== this.clipLength)
    {
      this.updateEngine = true;
      this.clipLength = this.state.clips.length
    }
    else
    {
      this.updateEngine = false;
    }
  }
  
  render(){
    return(
      <EngineContext.Consumer>
        {engine => 
         (<React.Fragment>
            { this.updateEngine ? engine.saveIns(this.state) : null }
            { engine.message === 'Loaded config' && !this.presetsLoaded ? this.loadPresets(engine.config) : null}
            <button onClick={this.saveSeq}>{this.props.isEdit ? 'PROPGATE NEW ' : 'CREATE NEW '} CLIP</button>
            <button value = {this.state.deletion} id='deletion' onClick={this.toggle}> DELETE/LOAD CLIPS ({this.state.deletion?'DEL':'LOAD'})</button>
            <button value = {this.state.chain} id='chain' onClick={this.toggle}> CHAIN CLIPS ({this.state.chain?'ON':'OFF'}) </button>
            <button value = 'connect' onClick={this.toggle}> ?CONNECT? (OFF) </button>
          </React.Fragment>)
        }
      </EngineContext.Consumer>
    )
  }
}

export { ComposeClips }
