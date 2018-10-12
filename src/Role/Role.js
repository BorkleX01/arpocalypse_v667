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
import {Detector} from '../EntityRelations'
import {Triggers} from '../EntityRelations'

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
      spliceLoc: '',
      newArr: [],
      newArrClips: [],
      newArrSettings : []
    }

    this.state.span = props.range[1] - props.range[0];
    this.clipRef = (id) => this.clipRef[id] = React.createRef()
    this.noteRef = (id) => this.noteRef[id] = React.createRef()
    this.transportRef = React.createRef();
    this.composer = React.createRef();

    this.spliceSeq = (seq, loc, ref, init) => {
      //console.log('SPLICE '+ seq  +' : name: ' + this.state.targetBankName + ', insert at: ' + loc + ' from instrument: ' + this.props.module);
      var data;
      if (seq === 'notes'){
        data = this.state.clips[this.state.currentSeq]
      } else if (seq === 'patterns'){
        data = this.state.clipSettings
      } else if (seq == 'patterns-data'){
        data = this.state.clips
      }

      let displacement = this.currentDragging - loc
      var currentShift
      var prevShift
      let newArr = [];
      var newArrSettings = [];
      //console.log(this.currentDragging);
      for (let el in data) {
        if(ref[el] != undefined && ref[el] !== null) {
          if (Math.abs(displacement) > 0){
            let disp = this.currentDragging - el;
            var dirL = disp >= 0 && displacement >= 0
            var dirR = disp <= 0 && displacement <= 0
            let rightOf = el >= loc
            let leftOf = el <= loc
            let shift = dirL && rightOf ? 'shift-right' : dirR && leftOf ? 'shift-left' : 'init'

            let rankAdjust = shift === 'shift-right' ? 1 : shift === 'shift-left' ? -1 : 0
            var cell = +el + rankAdjust
            ref[el].current.setState({shiftCss : shift})
            if(+el === +loc+rankAdjust ){
              currentShift = shift
            }
            
          }
          else
          {
            ref[el].current.setState({shiftCss : 'init'})
          }
        }
      }

      if(ref[loc].current.state.shiftCss !== 'init'){
        currentShift = 'init' ; ref[loc].current.setState({shiftCss : 'init'})
      }

      let dirStr = init + ' > ' + currentShift

      var insertion = loc
      if(dirStr === 'init > shift-left' || dirStr === 'shift-right > init'){

        if(+loc < +this.currentDragging ){
          insertion = loc+1
        }
      }

      if(dirStr === 'init > shift-right' || dirStr === 'shift-left > init'){

        if(+loc > +this.currentDragging){
          insertion = loc-1
          
        }else
        if (loc === 1 && this.currentDragging === 0){
          insertion = 0
        }
      }
      //console.log('========move '+ this.currentDragging +' to ' + insertion);
      for (let i = 0; i< data.length; i++)
      {
        if (this.currentDragging !== i){
          newArr.push(data[i])
        } else {
          let vec = (+this.currentDragging - i)
        }
        let dirDrag = (this.currentDragging - insertion) 
        if (insertion === i){
          if (dirDrag > 0){
            newArr[i] = (data[this.currentDragging])
            newArr.push(data[insertion])
          } else if (dirDrag < 0){
            newArr[i] = (data[this.currentDragging])
          } else 
          if(dirDrag === 0 ){
            newArr[i] = (data[+insertion])
          }
        }
      }
      if (seq == 'patterns')
      {
        this.setState({newArrClips: newArr})
      }
      else if (seq === 'patterns-data' )
      {
        this.setState({newArrSettings: newArr})
      }
      
    }

    var d = new Detector(this.props, this.state)

    this.transferFunction = (typeStr, obj, rest) => {
      var res = d.query(typeStr, obj, rest)

      if (res().op === 'reOrder'){
        this.setState({insert : res().arg})
      }else{
        this.setState({insert : ''})
      }
    }
    

    /*Merge patternBar and sequenceBar to class called ZoneListeners*/
    this.patternBar = (e) => {
      if(e.type === 'dragenter')
      {
        this.setState({
          targetBank: 'patterns',
          targetBankData: 'patterns-data',
          targetBankInst: this.props.module,
          targetBankName: 'instrument'
        })

        var el;
        if(e.target.id !== e.currentTarget.id){
          el = e.target.id
        }

        d.register(e)
        this.transferFunction(
          e.type, e.dataTransfer.getData("text/plain"),
          { module:this.props.module, zone: e.currentTarget.className, id: el != undefined && +el })
      }
      
      if(e.type === 'dragleave')
      {
        /*this.transferFunction(
          e.type, e.dataTransfer.getData("text/plain"))*/
      }
      
    }

    this.sequenceBar = (e) => {
      if(e.type === 'dragenter')
      {
        if(this.state.visible && this.state.currentSeq != ''){
          this.setState({
            targetBank: 'notes',
            targetBankInst: this.props.module,
            targetBankName: this.state.clipSettings[this.state.currentSeq][2]
          })
        }

        var el;
        if(e.target.id !== e.currentTarget.id){
          el = e.target.id
        }

        d.register(e)
        this.transferFunction(
          e.type, e.dataTransfer.getData("text/plain"),
          { module:this.props.module, zone: e.currentTarget.className, id: el != undefined && +el})
      }

      if(e.type === 'dragleave')
      {
        /*this.transferFunction(
          e.type, e.dataTransfer.getData("text/plain"))*/
      }      

      
    }

    this.renameClip = (e) => {
      let val = e.target.value
      this.composer.current.setState(state => {
        state.clipSettings[this.state.currentSeq][2] = val;
        this.clipRef[this.state.currentSeq].current.setState({name: val});
        return state})
    }
    
    
    this.doToClip = (e, ...rest) => {
      if(e === 'drop'){
        console.log('dropped via dotoClip: ' + rest);
        d.execute(this.state.newArrClips, this.state.newArrSettings, this.doToClip)
        
        for (let r in this.clipRef){
          this.clipRef[r].current.setState({shiftCss : 'init'})
        }
        this.clipRef[+this.currentDragging].current.setState({statusCss : 'init'})
      } 
      else if(rest.includes('declareDrag')){
        this.currentDragging = rest[0]
        this.clipRef[this.currentDragging].current.setState({statusCss : 'ghost'})
        this.transferFunction(e.type, e.dataTransfer.getData("text/plain"))
      }
      else if(e === 'reOrder'){
        if (this.state.insert === 'clip'){
          this.spliceSeq(this.state.targetBank, rest[0], this.clipRef, rest[1])
          this.spliceSeq(this.state.targetBankData, rest[0], this.clipRef, rest[1])
        }
      }else if (e === 'reOrdered'){
        if(rest[1].clipSettings.length > 0){
          this.composer.current.loadSimple(rest[1].clips, rest[1].clipSettings)
        }
        this.setState({
        clips : [],
        clipSettings : []})
      }
      else
      {
        let obj = e
        this.setState({
          editSeq : true ,
          currentSeq: String(obj),
          arpSettings : {tempoX : this.transportRef.current.state.tempoMultiplier}})
        
        const itr = this.state.clips[obj].values()
        var notes = []
        var cue = []

        for (const v of  itr) {
          notes.push(v[0])
          cue.push(v[1])
        }

        this.transportRef.current.setState({
          tempoMultiplier: + this.composer.current.state.clipSettings[obj][1]
        })

        props.listener(notes, cue, props.module, 'load')
      }
    }

    this.clipListener = (val, ...rest) => {
      if(rest.includes('tempoX')){
        this.setState({arpSettings: {tempoX : +val}})
        this.composer.current.setState({arpSettings : {tempoX : +val}})
        if(this.state.editSeq  === true) {
          this.composer.current.state.clipSettings[this.state.currentSeq][1] = +val
        }
      }
      
      this.setState({
        clips : this.composer.current.state.clips,
        clipSettings : this.composer.current.state.clipSettings})
    }
        
    

    this.doToNote = (e, ...rest) => {
      if(e === 'drop'){
        console.log('dropped via noteEdit: ' + rest);
        d.execute()
        for (let r in this.noteRef){
          if (this.noteRef[r].current !== null) {
            this.noteRef[r].current.setState({shiftCss : 'init', statusCss : 'init'})
          }
        }
      } 
      else if(rest.includes('declareDrag')){
        this.currentDragging = rest[0]
        this.noteRef[this.currentDragging].current.setState({statusCss : 'ghost'})
      }
      else if(e === 'reOrder'){
        if (this.state.insert === 'note'){
          this.spliceSeq(this.state.targetBank, rest[0], this.noteRef, rest[1] )
        }
      }
      else if(e === 'delete'){
        props.listener(rest[0], rest[1], props.module, 'delete' , this.state.editSeq ? 'edit' : null)
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
    console.log(this.state.clipSettings);
    //var clMap = this.state.clipSettings.entries()
    //var nwMap = this.state.newArr.entries()
    
    return(
      <div className={`role ${this.props.module} ${this.state.active ? 'active' : 'inactive'}`}>
        <div id={this.props.module} onClick={this.props.modeClick} className='key-inner ins-header'>
          {`${this.props.module} ${this.state.realTime ? '(Realtime)' : '(Step)'} ${this.props.tempo} ${this.transportRef.current && this.transportRef.current.state.isPlaying ? 'Playing' : 'Stopped'} `}
          {`${this.state.editSeq ? 'editing: ' + this.composer.current.state.clipSettings[this.state.currentSeq][2] : 'new sequence'}, Source: ${this.state.sourceBankModule}, Target: ${this.state.targetBankInst}`} 
        </div>

        <div className="messages">
        </div>
        
        <div id={this.props.module+'-clips'} className='sequence-collection'
             //onDrop={this.clipDrop}
             onDragEnter={this.patternBar}
             onDragLeave={this.patternBar}>
              { this.state.clips.length > 0 && this.composer.current.state.clipSettings != undefined ? 
                this.state.clips
                .map((o, i)=>
                     <ClipEdit
                       ref={this.clipRef(i)}
                       key={i}
                       id={i}
                       rank={i}
                       listener={this.doToClip}
                       transfer={this.transferFunction}
                       value={i}
                       patch={this.state.clipSettings != undefined ? this.state.clipSettings : 'default'}
                       instrument={this.props.module}
                       name={(this.composer.current.state.clipSettings[i] != undefined ?
                              this.composer.current.state.clipSettings[i][2] : i)}  />)
                :
                <div style={{textAlign:'left'}} className='messages'>SEQ</div>
              }
            </div>
            
        <div className='ins' style={{display : this.state.visible ? 'block' : 'none'}}>
          <div id={this.props.module+ '-notes'} className='note-collection'
               onDrop={this.noteDrop}
               onDragEnter={this.sequenceBar}
               onDragLeave={this.sequenceBar}>
            { this.props.seq.length > 0 ?
              this.props.seq
              .map((o, i) =>
                   <SeqEdit
                     ref={this.noteRef(i)}
                     key={i}
                     id={i}
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
            { this.state.currentSeq !== '' ?
              <div className="group-label">
                Rename clip:  <input id='rename-a-clip'
                                     className='text-input'
                                     value={this.composer.current.state.clipSettings[this.state.currentSeq][2]}
                                     onChange={this.renameClip} />
              </div>: null }
          </div>
          <div className='panel'>
            <button name='clearAll' onClick={this.clear}>CLEAR SEQ</ button>
            <ComposeClips
              ref = {this.composer}
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


//dataTransfer structure
//console.log('instrument: ' + this.props.module);
//console.log('patch: ' + this.state.clipSettings[this.state.currentSeq]);
//console.log('cellValue (note): ' + e.dataTransfer.getData("text/plain"));
//console.log('cellValue (note): ' + 42);
//console.log('bank: ' + this.state.clips[this.state.currentSeq]);

