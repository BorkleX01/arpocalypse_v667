import React,  { Component } from 'react'
import { EngineContext } from '../Engine/EngineContext'
class SaveSequence extends Component{
  constructor(props){
    super();
    this.state = {
      instrument : '',
      clips: [],
      clipSettings: [],
      arpSettings: {}
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
          state.clipSettings = [...state.clipSettings , [this.props.recTempo , this.state.arpSettings.tempoX]]
          this.props.clipListener(); //doToClip() in Role.js
          this.props.clear(); 
          return state})}}
  }


  render(){
    return(
      <EngineContext.Consumer>
        {engine => 
         (<React.Fragment>
            
            { this.state.clips.length > 0 ? engine.saveIns(this.state) : null }
          <button onClick={this.saveSeq}>{this.props.isEdit ? 'PROPGATE NEW ' : 'CREATE (FROM SEQ) A NEW '} CLIP</button>
          </React.Fragment>)
        }
      </EngineContext.Consumer>
    )
  }
}

export {SaveSequence}
