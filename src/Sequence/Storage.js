import React,  { Component } from 'react'
import { EngineContext } from '../Engine/EngineContext'
class SaveSequence extends Component{
  constructor(props){
    super();
    this.state = {
      instrument : '',
      clips: []
    }
    this.state.instrument = props.module;
    

    this.saveSeq = () => {
      if(this.props.seq){
        let clip = [];
        let thisSeq = this.props.seq;
        thisSeq.map((o,i)=>clip.push([this.props.seq[i], this.props.cue[i], this.props.recTempo]))
        this.setState(state => {
          state.clips = [...state.clips, clip]
          state.arp = this.props.arp
          this.props.clipListener()
          this.props.clear();
          return state})}}
  }
  componentDidUpdate(){
    
  }
  render(){
    return(
      <EngineContext.Consumer>
        {engine => 
         (<React.Fragment>
            {engine.saveIns(this.state)}
            <button onClick={this.saveSeq}>SAVE SEQ</button>
          </React.Fragment>)
        }
      </EngineContext.Consumer>
    )
  }
}

export {SaveSequence}
