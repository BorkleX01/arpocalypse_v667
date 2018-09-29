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
      deletion: false
    }

    this.state.instrument = props.module;
    this.state.arpSettings = props.arpSettings;

    this.saveSeq = () => {
      if(this.props.seq){
        let clip = [];
        let thisSeq = this.props.seq;
        thisSeq.map((o,i)=>clip.push([this.props.seq[i], this.props.cue[i]]))
        this.setState(state => {
          state.clips = [...state.clips, clip]
          state.clipSettings = [...state.clipSettings , [this.props.recTempo , this.state.arpSettings.tempoX, this.state.clips.length-1,]]
          this.props.clipListener(); //doToClip() in Role.js
          //this.props.clear(); 
          return state})}}

    this.mode = (e) => {
      console.log(e.target.value);
      
      
    }
  }
  
  componentDidUpdate(){
    
  }

  render(){
    return(
      <EngineContext.Consumer>
        {engine => 
         (<React.Fragment>
            { this.state.clips.length > 0 ? engine.saveIns(this.state) : null }
            <button onClick={this.saveSeq}>{this.props.isEdit ? 'PROPGATE NEW ' : 'CREATE NEW '} CLIP</button>
            <button value = 'load' onClick={this.mode}> DELETE/LOAD CLIPS (LOAD)</button>
            <button value = 'join' onClick={this.mode}> JOIN CLIPS (OFF) </button>
          </React.Fragment>)
        }
      </EngineContext.Consumer>
    )
  }
}

export { ComposeClips }
