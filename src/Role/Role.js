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

      
      targetBankInst: '',
      targetBankName: '',
      targetBankNote: '',
      targetBank: '',
      
      
      sourceBankModule: '',
      sourceBankPatch: '',
      sourceBankRank: '',
      sourceBankNote: '',
      sourceBank: '',
      
    }

    this.state.span = props.range[1] - props.range[0];
    this.clipRef = (id) => this.clipRef[id] = React.createRef()
    this.noteRef = (id) => this.noteRef[id] = React.createRef()
    this.transportRef = React.createRef();
    this.storageRef = React.createRef();

    this.spliceSeq = (seq, loc, ref, init) => {
      console.log('SPLICE '+ seq  +' : name: ' + this.state.targetBankName + ', pattern#: ' + loc + ' from instrument: ' + this.props.module);
      var data;
      if (seq === 'notes'){
        data = this.state.clips[this.state.currentSeq]
      } else if (seq === 'patterns'){
        data = this.state.clips
      } 

      
      let displacement = this.currentDragging - loc
      for (let el in data){
        if(ref[el] != undefined && ref[el] !== null){
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
        }
      }
      if(ref[loc].current.state.shiftCss !== 'init'){ ref[loc].current.setState({shiftCss : 'init'}) }
    }


    this.patternBarEnter = (e) => {
      console.log('patternBarEnter: '  + e.dataTransfer.getData("text/plain"));

      this.setState({
        targetBank: 'patterns',
        targetBankInst: this.props.module,
        targetBankName: 'instrument'
      })
    }

    this.sequenceBarEnter = (e) => {
      console.log('sequenceBarEnter: ' + e.dataTransfer.getData("text/plain"));

      if(this.state.visible && this.state.currentSeq != '') {
        this.setState({
          targetBank: 'notes',
          targetBankInst: this.props.module,
          targetBankName: this.state.clipSettings[this.state.currentSeq][2]})
      }
    }
    
    this.transferFunction = (sourceObj) => {
      //console.log('transfer: ' + sourceObj.instrument);
      //console.log(sourceObj);
    }
    
    this.patternBarEnter = (e) => {
      console.log('patternBarEnter: '  + e.dataTransfer.getData("text/plain"));

      this.setState({
        targetBank: 'patterns',
        targetBankInst: this.props.module,
        targetBankName: 'instrument'
      })
    }

    this.sequenceBarEnter = (e) => {
      console.log('sequenceBarEnter: ' + e.dataTransfer.getData("text/plain"));
      
      //console.log('instrument: ' + this.props.module);
      //console.log('patch: ' + this.state.clipSettings[this.state.currentSeq]);
      //console.log('cellValue (note): ' + e.dataTransfer.getData("text/plain"));
      //console.log('cellValue (note): ' + 42);
      //console.log('bank: ' + this.state.clips[this.state.currentSeq]);

      if(this.state.visible && this.state.currentSeq != ''){
        this.setState({targetBank: 'notes', targetBankInst: this.props.module, targetBankName: this.state.clipSettings[this.state.currentSeq][2]})
      }
    }
    
    this.clipDrop = (e) => {
      console.log('Role Clip Drop handler');
      //console.log(e);
    }

    this.noteDrop = (e) => {
      console.log('Role note Drop handler');
      //console.log(e);
    }

    this.doToClip = (e, ...rest) => {
      if(e === 'clipDrop'){
        console.log('dropped via clipEdit: ' + rest[0] + ' ' + this.state.clips.length);
        //if (this.state.clips.length-1 === +rest[0]){console.log('bogus')}
        for (let r in this.clipRef){
          this.clipRef[r].current.setState({shiftCss : 'init'})
        }
        this.clipRef[+this.currentDragging].current.setState({statusCss : 'init'})
      } 
      else if(e === 'registerDrag'){
        this.currentDragging = rest[0]
        this.clipRef[this.currentDragging].current.setState({statusCss : 'ghost'})
        //this.setState({sourceBankModule: this.props.module , targetBank: this.state.clips})
      }
      else if(e === 'reportDrag'){
        this.spliceSeq(this.state.targetBank, rest[0], this.clipRef, rest[1])
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
        
    

    this.doToNote = (e, ...rest) => {
      if(e === 'noteDrop'){
        console.log('dropped via noteEdit: ' + rest[0] + ' ' + this.state.targetBankName);
        for (let r in this.noteRef){
          if (this.noteRef[r].current !== null) {
            this.noteRef[r].current.setState({shiftCss : 'init', statusCss : 'init'})
          }
        }
      } 
      else if(e === 'registerDrag'){
        this.currentDragging = rest[0]
        this.noteRef[this.currentDragging].current.setState({statusCss : 'ghost'})
      }
      else if(e === 'reportDrag'){
        this.spliceSeq(this.state.targetBank, rest[0], this.noteRef)
      }
      else {
        props.listener(e, rest[1], props.module, 'edit' )
      }
    }

    this.play = (id) => {
      this.setState({noteOn: true});
      this.props.playNote(id, this.props.freq[id])
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

  
  render(){ 
    return(
      <div className={`role ${this.props.module} ${this.state.active ? 'active' : 'inactive'}`}>
        <div id={this.props.module} onClick={this.props.modeClick} className='key-inner ins-header'>
          {`${this.props.module} ${this.state.realTime ? '(Realtime)' : '(Step)'} ${this.props.tempo} ${this.transportRef.current && this.transportRef.current.state.isPlaying ? 'Playing' : 'Stopped'} `}
          {`${this.state.editSeq ? 'editing: ' + this.storageRef.current.state.clipSettings[this.state.currentSeq][2] : 'new sequence'}, Source: ${this.state.sourceBankModule}, Target: ${this.state.targetBankInst}`} 
        </div>

        <div className="messages">
        </div>
        
        <div className='sequence-collection' onDrop={this.clipDrop} onDragEnter={this.patternBarEnter}>
              { this.state.clips.length > 0 && this.storageRef.current.state.clipSettings != undefined ? 
                this.state.clips
                .map((o, i)=>
                     <ClipEdit
                       ref={this.clipRef(i)}
                       key={i}
                       id={this.props.module+'Clip'+i}
                       rank={i}
                       listener={this.doToClip}
                       transfer={this.transferFunction}
                       value={i}
                       patch={this.state.clipSettings != undefined ? this.state.clipSettings : 'default'}
                       instrument={this.props.module}
                       name={(this.storageRef.current.state.clipSettings[i] != undefined ?
                              this.storageRef.current.state.clipSettings[i][2] : i)}  />)
                :
                <div style={{textAlign:'left'}} className='messages'>SEQ</div>
              }
            </div>
            
        <div className='ins' style={{display : this.state.visible ? 'block' : 'none'}}>
          <div className='note-collection' onDrop={this.noteDrop} onDragEnter={this.sequenceBarEnter}>
            { this.props.seq.length > 0 ?
              this.props.seq
              .map((o, i) =>
                   <SeqEdit
                     ref={this.noteRef(i)}
                     key={i}
                     id={this.props.module+i}
                     rank={i}
                     listener={this.doToNote}
                     transfer={this.transferFunction}
                     value={o}
                     patch={this.state.clipSettings != undefined ? this.state.clipSettings[this.state.currentSeq] : 'default'}
                     instrument={this.props.module}
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


//console.log('instrument: ' + this.props.module);
      //console.log('patch: ' + this.state.clipSettings[this.state.currentSeq]);
      //console.log('cellValue (note): ' + e.dataTransfer.getData("text/plain"));
      //console.log('cellValue (note): ' + 42);
//console.log('bank: ' + this.state.clips[this.state.currentSeq]);


      
      /*this.setState({
        sourceBankModule: obj.instrument,
        sourceBankPatch: obj.patch,
        sourceBankRank: obj.rank,
        sourceBankNote: obj.cellValue,
        })*/
      //console.log(this.state.targetBankInst);
      //console.log(this.state.targetBankName);
      //this.props.listener(this.state.sourceObj, this.state.targetObj, this.props.module, 'exports' )
