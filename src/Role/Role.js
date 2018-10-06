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
      currentSeq: '',
      dragMember: {noIns : -1},
      dragLoc: -1
    }

    this.state.span = props.range[1] - props.range[0];
    this.clipRef = (id) => this.clipRef[id] = React.createRef()
    this.noteRef = (id) => this.noteRef[id] = React.createRef()
    
    this.doToNote = (e) => {
      props.listener(e.target.value, e.target.id, props.module, 'edit' )
    }

    this.spliceSeq = (seq, loc, ref) => {
      //console.log('splice: at ' + loc + ' of ' + seq.length + ': ' + ref[loc].current);
      let displacement = this.currentDragging - loc
      let l = seq.length;
      //console.log(this.currentDragging + ' ' + loc + ' ' + displacement);
      //console.log(this.currentDragging - displacement);
      for (let el in seq){
        //console.log('el: ' + el + ' ' + (this.currentDragging - displacement));
        if (displacement !== 0 ){
          let disp = this.currentDragging - el;
          console.log(displacement + ' ' + disp);
          ref[el].current.setState({shiftCss : disp > 0 && displacement >= 0 && el >= (this.currentDragging - displacement) ? 'shift-right' :
                                    disp < 0 && displacement <= 0 && el <= (this.currentDragging - displacement) ? 'shift-left' : null })

          /*: disp < 0 && displacement < 0 && el <= (this.currentDragging + displacement) ?'shift-left' : null :null})*/
                                    
        }
        else
        {
          ref[el].current.setState({shiftCss : 'init'})
        }
      } 
    }

    this.doToClip = (e, ...rest) => {
      if(e === 'clipDrop'){
        console.log('dropped ' + rest[0] );

        for (let r in this.clipRef){
          console.log(r);
          this.clipRef[r].current.setState({shiftCss : 'init'})
        }
        this.clipRef[this.currentDragging].current.setState({statusCss : 'init'})
        
      } else
      if(e === 'regDrag'){
        console.log('regDrag');
        this.currentDragging = rest[0]
        this.clipRef[this.currentDragging].current.setState({statusCss : 'ghost'})
      }
      else if(e === 'reportDrag'){
        console.log('reportDrag');
        this.spliceSeq(this.state.clips, rest[0], this.clipRef)
      }
      else
      {
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
        //document.getElementById(this.props.module+''+t).setAttribute('class', 'role-edit '+ this.props.module + ' note-on')
        let x = t === 0 ? this.props.seq.length-1 : t-1
        this.noteRef[x].current.state.css = ''
        //document.getElementById(this.props.module+''+x).setAttribute('class', 'role-edit')
      }

    }

    this.transportRef = React.createRef();
    this.storageRef = React.createRef();
    

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
    this.renameClip = (e) => {
      let val = e.target.value
      this.storageRef.current.setState(state => {
        state.clipSettings[this.state.currentSeq][2] = val;
        this.clipRef[this.state.currentSeq].current.setState({name: val});
        return state})
    }

    this.clipOver = (e) => {
      console.log('over');
      e.preventDefault();
      console.log(e.dataTransfer.getData('text/plain'));
    }

    this.clipDrop = (e) => {
      e.preventDefault();
      console.log('clip drop: ' + e.dataTransfer.getData('text/plain'));
      this.clipRef[this.currentDragging].current.setState({statusCss : 'init'})
    }

    /*this.roleOver = (e) => {
      console.log('role over');
      e.preventDefault();
      console.log(e.dataTransfer.getData('text/plain'));
    }
    */
    this.roleDrop = (e) => {
      console.log('role drop');
      e.preventDefault();
      console.log(e.dataTransfer.getData('text/plain'));
      
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
                       <ClipEdit ref={this.clipRef(i)}
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
                     value={o}
                     onClick={this.doToNote}
                     id={this.props.module+i}
                     rank={i}
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
