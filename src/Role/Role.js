import React,  { Component } from 'react'
import './Role.css'
import '../Engine/Engine.css'
import { EngineContext } from '../Engine/Engine'
import { Keys } from '../Keys'
import { Transport } from '../Sequence/Transport'
import { SaveSequence } from '../Sequence/Storage' 
import Spinner from '../Widgets/Spinner' 


class Role extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
      noteOn : -1,
      visible : false,
      clips: [],
      currentTempo: this.props.tempo,
      active: false,
      scheduleStart: false,
      span: 72
    }

    this.state.span = props.range[1] - props.range[0];
    
    this.doToNote = (e) => {
      props.listener(e.target.value, e.target.id, props.module)
    }

    this.doToClip = (e) => {
      let obj = e.target.value
      const itr = this.state.clips[obj].values()
      var notes = []
      var cue = []
      for (const v of  itr) {
        notes.push(v[0])
        cue.push(v[1])
      }
      props.listener(notes, cue, props.module, 'load')
    }

    this.play = (id) => {
      this.props.playNote(id, this.props.freq[id]);
    }

    this.clear = () => {
      this.props.clear(this.props.module)
    }

    this.tick = (t) => {
      if(this.props.seq.length > 0 ){
        document.getElementById(this.props.module+''+t).setAttribute('class', 'role-edit '+ this.props.module + ' note-on')
        let x = t === 0 ? this.props.seq.length-1 : t-1
        document.getElementById(this.props.module+''+x).setAttribute('class', 'role-edit')
      }
    }

    this.storageRef = React.createRef();
    this.transportRef = React.createRef();

    this.clipListener = () => {
      this.setState({clips : this.storageRef.current.state.clips})
    }

    this.changeRange = (v) => {
      let val = +v;
      let end = +(val+this.state.span)
      props.listener(val, end, props.module, 'range')
    }

    this.changeSpan = (v) => {
      let val = +v;
      this.setState(state=>{
        state.span = val
        this.changeRange(this.props.range[0])
        return state})
    }
    
  }

  componentDidUpdate(){
    //console.log(this.props.noteOn[1]) ;
  }

  render() {
    return(
      <div className={`role ${this.props.module} ${this.state.active ? 'active' : 'inactive'}`}>
        <div id={this.props.module} onClick={this.props.modeClick} className='key-inner ins-header'>
          {`${this.props.module} ${this.props.realTime ? '(Realtime)' : '(Step)'} ${this.props.tempo} `}
          
        </div>
        {this.props.module === 'treble' ? 'There is no Record button as such. Intervals are captured between each noteOn event. Tunes in the sequence bank are circular buttons. Clicking them will load them but you must press play to hear them. They should play back with the same timing as when you performed them.' : 'The step sequencer will just repeat all notes played in order but timed to the tempo. Frequency and Repeat do not work yet but Speed multiplies the tempo.'}
        <div className='ins' style={{display : this.state.visible ? 'block' : 'none'}}>
          <Transport
            ref={this.transportRef}
            tick={this.tick}
            tempo={this.props.tempo}
            seq={this.props.seq}
            cue={this.props.cue}
            play={this.play}
            start={this.state.scheduleStart}
            type={this.props.realTime ? 'realtime' : 'step'}/>
          <div className='panel'>
            <SaveSequence
              module = {this.props.module}
              ref = {this.storageRef}
              clear={this.clear}
              seq={this.props.seq}
              cue={this.props.cue}
              recTempo={this.props.tempo}
              clipListener={this.clipListener}/>
            <button name='clearAll' onClick={this.clear}>CLEAR SEQ</button>
            <div className="pane">
              <Spinner
                label={this.props.module + ' offset'}
                slider={true} value={this.props.range[0]}
                onChange={this.changeRange}
                min={0} max={96-12} step={12}/>
            </div>
            <div className="pane">
              <Spinner
                label={this.props.module + ' range'}
                slider={true} value={this.state.span}
                onChange={this.changeSpan}
                min={1} max={96} step={1}/>
            </div>
            <div className='sequence-collection'>
              { this.state.clips.length > 0 ? 
                this.state.clips
                .map((o, i)=>
                     <div key={i} className={'sequence-edit'} id={this.props.module+'Clip'+i}>
                       <button id={i} value={i} onClick={this.doToClip}>{i}</button>
                     </div>)
                :
                <div className='messages'>Patterns appear here if you click Save Seq. Clicking them will load them. If the step sequencer is still playing the new pattern will start automatically. The realtime sequencer does not do this. </div>
              }
            </div>
            <div className='note-collection'>
              {this.props.seq.length > 0 ?
               this.props.seq
               .map((o, i) =>
                    <div key={i} className={'role-edit'} id={this.props.module+i}>
                      <button id={i} value={o} onClick={this.doToNote}>
                        {this.props.obj[o].nom + '' + (this.props.obj[o].type === 'black-key' ? '#' : '')}
                      </button>
                    </div>)
               :
               <div className='messages'>Notes appear here. Click them to delete</div>
              }
            </div>
          </div>
          
        </div>
      </div>
    )}
}
export default Role
