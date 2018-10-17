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

    this.mode = (e) => {
      //console.log(e.target.value);
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
    
    if(this.state.clips.length !== this.clipLength){
      this.updateEngine = true;
      this.clipLength = this.state.clips.length
    }else{
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
            <button value = 'load' onClick={this.mode}> DELETE/LOAD CLIPS (LOAD)</button>
            <button value = 'join' onClick={this.mode}> JOIN CLIPS (OFF) </button>
            <button value = 'connect' onClick={this.mode}> CONNECT (OFF) </button>
          </React.Fragment>)
        }
      </EngineContext.Consumer>
    )
  }
}

export { ComposeClips }
