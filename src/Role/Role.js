import React,  { Component } from 'react'
import { Keys } from '../Keys'
import { Transport } from '../Sequence/StepSequencer'
import './Role.css'
import '../Engine/Engine.css'
import { EngineContext } from '../Engine/Engine'


class Role extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
    }
    
    this.doToNote = (e) => {
      props.listener(e.target.value, e.target.id, props.module)
    }

    this.play = (id) => {
      this.props.playNote(id, this.props.freq[id]);
    }

    this.clear = (e) => {
      this.props.clear(this.props.module)
    }

  }
  render() {
    return(
      <div className={'role ' + this.props.module}>
        <div className='key-inner'>{this.props.module}</div>
        <Transport tempo={this.props.tempo} seq={this.props.seq} play={this.play}/>
        <div className='note-collection'>
          <button name='clearAll' onClick={this.clear}>CLEAR SEQ</button>
          {Object.values(this.props.seq).length > 0 ?
            Object.values(this.props.seq).map((o, i) => <button className='role-edit' key={i} id={Object.keys(this.props.seq)[i]} value={o} onClick={this.doToNote}>{o}</button>)
           :
           <div className='messages'>Delete sequence entries that appear here</div>}
      </div>
        
      </div>
        
    )}
}
export default Role
