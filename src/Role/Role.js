import React,  { Component } from 'react'
import './Role.css'
import '../Engine/Engine.css'
import { EngineContext } from '../Engine/Engine'
import { Keys } from '../Keys'
import { Transport } from '../Sequence/Transport'
import { ComposeClips } from '../Sequence/Compose' 
import Spinner from '../Widgets/Spinner'
import ClipEdit from './ClipEdit'
import SeqEdit from './SeqEdit'


class Role extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
      noteOn : false,
      visible : true,
      clips: [],
      clipSettings: [],
      currentTempo: this.props.tempo,
      active: false,
      scheduleStart: false,
      arpSettings : {tempoX : 1},
      realTime: false,
      editSeq: false,
      currentSeq: ''
    }

    this.state.span = props.range[1] - props.range[0];
    this.clipRef = (id) => this.clipRef[id] = React.createRef()
    this.noteRef = (id) => this.noteRef[id] = React.createRef()
    this.transportRef = React.createRef();
    this.storageRef = React.createRef();

    this.spliceSeq = (seq, loc, ref, init) => {
      //console.log(seq);
      let displacement = this.currentDragging - loc
      for (let el in seq){
        if (Math.abs(displacement) > 0){
          let disp = this.currentDragging - el;
          ref[el].current
            .setState
          ({shiftCss :
            disp > 0 && displacement >= 0 && el >= (this.currentDragging - displacement) ?
            (ref[loc].current.state === 'shift-right' ? 'init' : 'shift-right') :
            disp < 0 && displacement <= 0 && el <= (this.currentDragging - displacement ) ?
            (ref[loc].current.state === 'shift-left' ? 'init' : 'shift-left') : 'init'
           })
        }
        else
        {
          ref[el].current.setState({shiftCss : 'init'})
        }

        if(ref[loc].current.state.shiftCss !== 'init'){ ref[loc].current.setState({shiftCss : 'init'}) }
      } 
    }

    this.doToNote = (e, ...rest) => {
      if(e === 'noteDrop'){
        console.log('dropped via noteEdit: ' + rest[0] );
        for (let r in this.noteRef){
          this.noteRef[r].current.setState({shiftCss : 'init'})
        }
        this.noteRef[this.currentDragging].current.setState({statusCss : 'init'})
      } 

      else if(e === 'registerDrag'){
        this.currentDragging = rest[0]
        this.noteRef[this.currentDragging].current.setState({statusCss : 'ghost'})
      }
      else if(e === 'reportDrag'){
        this.spliceSeq(this.state.clips[this.state.currentSeq], rest[0], this.noteRef, rest[1])
      }
      else {
        props.listener(e.target.value, e.target.id, props.module, 'edit' )
      }
    }
    

    this.clipListener = (val, ...rest) => {
      if(rest.includes('tempoX')){
        this.setState({arpSettings: {tempoX : +val}})
        this.storageRef.current.setState({arpSettings : {tempoX : +val}})
        if(this.state.editSeq  === true) {
          this.storageRef.current.state.clipSettings[this.state.currentSeq][1] = +val
        }
      }
      this.setState({clips : this.storageRef.current.state.clips, clipSettings : this.storageRef.current.state.clipSettings})
    }

    this.doToClip = (e, ...rest) => {
      if(e === 'clipDrop'){
        console.log('dropped via clipEdit: ' + rest[0] );
        for (let r in this.clipRef){
          this.clipRef[r].current.setState({shiftCss : 'init'})
        }
        this.clipRef[this.currentDragging].current.setState({statusCss : 'init'})
      } 

      else if(e === 'registerDrag'){
        this.currentDragging = rest[0]
        this.clipRef[this.currentDragging].current.setState({statusCss : 'ghost'})
      }
      else if(e === 'reportDrag'){
        this.spliceSeq(this.state.clips, rest[0], this.clipRef, rest[1])
      }
      else{
        let obj = e
        this.setState({editSeq : true , currentSeq: String(obj), arpSettings : {tempoX : this.transportRef.current.state.tempoMultiplier}})
        const itr = this.state.clips[obj].values()
        var notes = []
        var cue = []
        for (const v of  itr) {
          notes.push(v[0])
          cue.push(v[1])
        }
        this.transportRef.current.setState({tempoMultiplier: + this.storageRef.current.state.clipSettings[obj][1]})
        props.listener(notes, cue, props.module, 'load')
      }
    }
    
    this.renameClip = (e) => {
      let val = e.target.value
      this.storageRef.current.setState(state => {
        state.clipSettings[this.state.currentSeq][2] = val;
        this.clipRef[this.state.currentSeq].current.setState({name: val});
        return state})
    }

    this.clipDrop = (e) => {
      console.log('Role Clip Drop hanfler');
      console.log(e);
    }
    

    this.play = (id) => {
      this.setState({noteOn: true});
      this.props.playNote(id, this.props.freq[id]);
    }

    this.clear = () => {
      this.setState({editSeq : false })
      this.props.clear(this.props.module)
    }

    this.tick = (t) => {
      if(this.props.seq.length > 0 ){
        //console.log(t); //this is cool
        this.noteRef[t].current.state.css = this.props.module +' note-on'
        let x = t === 0 ? this.props.seq.length-1 : t-1
        this.noteRef[x].current.state.css = ''
      }

    }

    
  }
  
  componentWillReceiveProps(newProps){
    if(newProps.clips && newProps.clips.length > 0 ){
      this.setState({clips : newProps.clips})
    }
  }

  componentDidUpdate(){
  }
  
  render(){ 
    return(
      <div className={`role ${this.props.module} ${this.state.active ? 'active' : 'inactive'}`}>
        <div id={this.props.module} onClick={this.props.modeClick} className='key-inner ins-header'>
          {`${this.props.module} ${this.state.realTime ? '(Realtime)' : '(Step)'} ${this.props.tempo} ${this.transportRef.current && this.transportRef.current.state.isPlaying ? 'Playing' : 'Stopped'} `}
          {`${this.state.editSeq ? 'editing: ' + this.storageRef.current.state.clipSettings[this.state.currentSeq][2] : 'new sequence'}`} 
        </div>

        <div className="messages">
        </div>
        
        <div className='sequence-collection' onDrop={this.clipDrop}>
              { this.state.clips.length > 0 && this.storageRef.current.state.clipSettings != undefined ? 
                this.state.clips
                .map((o, i)=>
                     <ClipEdit
                       ref={this.clipRef(i)}
                       key={i}
                       id={this.props.module+'Clip'+i}
                       rank={i}
                       listener={this.doToClip}
                       value={i}
                       name={(this.storageRef.current.state.clipSettings[i] != undefined ?
                              this.storageRef.current.state.clipSettings[i][2] : i)}  />)
                :
                <div style={{textAlign:'left'}} className='messages'>SEQ</div>
              }
            </div>
            
        <div className='ins' style={{display : this.state.visible ? 'block' : 'none'}}>
          <div className='note-collection' onDrop={this.roleDrop}>
            { this.props.seq.length > 0 ?
              this.props.seq
              .map((o, i) =>
                   <SeqEdit
                     ref={this.noteRef(i)}
                     key={i}
                     id={this.props.module+i}
                     rank={i}
                     onClick={this.doToNote}
                     listener={this.doToNote}
                     value={o}
                     label={this.props.obj[o].nom + '' + (this.props.obj[o].type === 'black-key' ? '#' : '')}/>)
              :
              <div style={{textAlign:'left'}} className='messages'>SEQ</div>
            }
          </div>
          
          <div> 
            { this.state.currentSeq !== '' ? <div className="group-label">Rename clip:  <input id='rename-a-clip' className='text-input' value={this.storageRef.current.state.clipSettings[this.state.currentSeq][2]}  onChange={this.renameClip}></input> </div>: null }
          </div>
          <div className='panel'>
            <button name='clearAll' onClick={this.clear}>CLEAR SEQ</ button>
            <ComposeClips
              ref = {this.storageRef}
              module = {this.props.module}
              clear={this.clear}
              seq={this.props.seq}
              cue={this.props.cue}
              isEdit={this.state.editSeq}
              arpSettings={this.state.arpSettings}
              recTempo={this.props.tempo}
              clipListener={this.clipListener}/>
          </div>
          
          <Transport
            ref={this.transportRef}
            tick={this.tick}
            tempo={this.props.tempo}
            seq={this.props.seq}
            cue={this.props.cue}
            play={this.play}
            start={this.state.scheduleStart}
            clipListener={this.clipListener}
            type={this.state.realTime ? 'realtime' : 'step'}/>
        </div>
      </div>
    )}
}
export default Role
