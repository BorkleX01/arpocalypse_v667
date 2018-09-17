import React,  { Component } from 'react'
class SaveSequence extends Component{
  constructor(props){
    super();
    this.state = {
      clips: []
    }
    
    this.saveSeq = () => {
      if(this.props.seq){
        let clip = [];
        let thisSeq = this.props.seq;

        thisSeq.map((o,i)=>clip.push([this.props.seq[i], this.props.cue[i]]))
        
        this.setState(state => {state.clips = [...state.clips, clip]
                                this.props.clipListener()
                                this.props.clear()
                                return state})
      }
    }

    this.loadSeq = (e) => {
      console.log(this.state.clips);
    }
  }

  componentDidUpdate(){
    
  }
  render(){
    return(
      <React.Fragment>
        <button onClick={this.saveSeq}>SAVE SEQ</button>
        <button onClick={this.loadSeq}>LOAD SEQ</button>
      </React.Fragment>
    )
  }
}

export {SaveSequence}
