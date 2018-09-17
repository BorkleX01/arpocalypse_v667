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
      noteOn : -1
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

    this.tick = (t) => {
      if(this.props.seq.length > 0 ){
      document.getElementById(this.props.module+''+t).setAttribute('class', 'role-edit '+ this.props.module + ' note-on')
      let x = t === 0 ? this.props.seq.length-1 : t-1
        document.getElementById(this.props.module+''+x).setAttribute('class', 'role-edit')
      }
    }

  }
  render() {
    return(
      <div className={'role ' + this.props.module}>
        <div className='key-inner'>{this.props.module}</div>
        <Transport tick={this.tick} tempo={this.props.tempo} seq={this.props.seq} play={this.play}/>
        <div className='note-collection'>
          <button name='clearAll' onClick={this.clear}>CLEAR SEQ</button>
          {this.props.seq.length > 0 ?
            this.props.seq.map((o, i) => <div className={'role-edit'} id={this.props.module+i}><button key={i} id={i} value={o} onClick={this.doToNote}>{o}</button></div>)
           :
           <div className='messages'>Delete sequence entries that appear here</div>}
      </div>
        
      </div>
        
    )}
}
export default Role
