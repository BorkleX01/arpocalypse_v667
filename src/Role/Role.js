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
import { Detector } from '../EntityRelations'
import { Triggers } from '../EntityRelations'

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
      currentPatternName: '',
      seq : this.props.seq,
      newSeq: this.props.seq,
      swapSeq: this.props.seq,
      spliceLoc: '',
      newArr: [],
      newArrClips: [],
      newArrSettings : [],
      insert: 'note',
      currentOp: '',
      chain: true
    }

    this.clipRef = {}
    this.noteRef = {}
    this.state.span = props.range[1] - props.range[0];
    this.clipRefMake = (id) => this.clipRef[id] = React.createRef()
    this.noteRefMake = (id) => this.noteRef[id] = React.createRef()
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

      if (seq === 'notes'){
        this.setState({newSeq : newArr})
      }
      
    }

    var d = new Detector(this.props, this.state)

    this.transferFunction = (typeStr, obj, rest) => {

      var res = d.query(typeStr, obj, rest)

      this.setState({currentOp: res().op})
      
      if (res().op === 'reOrder'){
        this.setState({insert : res().arg}) //do I need this?
      }else{
        this.setState({insert : ''})
      }
    }

    this.storePayload = (a) => {
      d.storePayload(a)
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

        let transferPayload = e.dataTransfer.getData('text/plain')
        this.transferFunction(
          e.type, e.dataTransfer.getData("text/plain"),
          { module:this.props.module, zone: e.currentTarget.className, id: el != undefined && +el })
      }
      
      if(e.type === 'dragleave')
      {

        console.log('leaving: ' + e.target.id);

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
        console.log('leaving ' + e.target.id);
        /*this.transferFunction(
          e.type, e.dataTransfer.getData("text/plain"))*/
      }      
    }

    this.clipNameEdit = (e) => {
      if (e.key === 'Enter'){
        console.log('Enter: maybe edit next pattern? Maybe escape from context?')
      }else if (e.key === 'Backspace' || e.key === 'Delete'){
        let val  = String(this.clipRef[this.state.currentSeq].current.state.name)
        val = val.slice(0,val.length-1)
        this.clipRef[this.state.currentSeq].current.setState({name: val});
        this.setState({currentPatternName: val})
      }else{
        if (e.keyCode !== 16 && e.keyCode !== 17 && e.keyCode !== 18 ){
          let val  = this.clipRef[this.state.currentSeq].current.state.name + e.key
          this.clipRef[this.state.currentSeq].current.setState({name: val});
          this.setState({currentPatternName: val})
        }
      }
    }

    this.renameClip = (e) => {
      let val = e.target.value

      let seq = this.state.currentSeq
      let set = this.state.clipSettings
      let name = set[seq][2]
      
      //this.composer.current.setState({clipSettings[seq][2] : val})

      this.composer.current.setState(state => {
        state.clipSettings[seq][2] = val;
        return state})
      
      //console.log(this.composer.current.state.clipSettings);
      //this.clipRef[this.state.currentSeq].current.setState({name: val});
    }

    this.getClipName = () => {
      let seq = this.state.currentSeq
      let set = this.composer.current.state.clipSettings
      let name = set[seq][2]
      return name
    }
    
    this.doToClip = (e, ...rest) => {
      //console.log(d.currentOp);
      if(e === 'drop'){
        //console.log('dropped via dotoClip: ' + rest + ' ' + this.state.currentSeq);
        //console.log(d.currentOp.arg);
        if (d.currentOp.op === 'triggerNote'){
          d.execute('triggerNote', d.currentOp.arg, this.state.clips[rest], this.state.clipSettings[rest], this.state.currentSeq, this.state.seq)
          this.setState(state => {//simple chains
            if (state.clipSettings[this.state.currentSeq][3] == undefined){
              state.clipSettings[this.state.currentSeq][3] = [[this.state.currentSeq, rest, d.currentOp.arg.target.id]]
            }else {//concurrent
              //state.clipSettings[this.state.currentSeq][3].push([this.state.currentSeq, rest, d.currentOp.arg.target.id])
              state.clipSettings[this.state.currentSeq][3] = [[this.state.currentSeq, rest, d.currentOp.arg.target.id]]
            }
            //console.log(state.clipSettings[rest][2]);
            this.noteRef[d.currentOp.arg.target.id].current.setState({trigs: state.clipSettings[rest][2]})

            return state})
        }

        if (d.currentOp.op === 'reOrder'){
          d.execute('moveClip', this.doToClip, this.state.newArrClips, this.state.newArrSettings)
        }
        //reset icons and render trigger markers
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
      else if (rest.includes('playClip')) //this is retarded
      {

        
        let obj = e
        this.setState({
          editSeq : true ,
          currentSeq: String(obj),
          arpSettings : {tempoX : this.transportRef.current.state.tempoMultiplier},
          currentPatternName: this.state.clipSettings[obj][2]
        })

        /*let markedNote = this.state.clipSettings[+obj]
        if( markedNote != undefined){
          if (markedNote[3] != undefined){
            let ind = markedNote[3][0][2]
            let mark = markedNote[3][0][1]
            console.log('noteref');
            this.noteRef[ind].current.setState({trigs : this.state.clipSettings[mark][2]})
          }
        }
        */

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

        this.state.clips.map((o, i)=>{
          this.clipRef[i].current.setState({playingCss : 'not-playing'})
        })

        this.clipRef[e].current.setState({playingCss : 'playing'})
        this.props.listener(notes, cue, this.props.module, 'load')
      }
      else {
        console.log('clip action no name');
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
      //console.log(d.currentOp);
      var returnVal
      if(e === 'drop'){
        console.log('dropped via noteEdit: ' + rest);
        d.execute('moveNote' , this.doToNote, this.state.newSeq)
        for (let r in this.noteRef){
          if (this.noteRef[r].current !== null) {
            this.noteRef[r].current.setState({shiftCss : 'init', statusCss : 'init'})
          }
        }
        
        this.noteRef[this.currentDragging].current.setState({statusCss : 'init'})
      } 
      else if(rest.includes('declareDrag')){
        this.currentDragging = rest[0]
        this.noteRef[this.currentDragging].current.setState({statusCss : 'ghost'})
      }
      else if(e === 'reOrder'){
        //console.log(this.state.clips[this.state.currentSeq]);
        if (this.state.insert === 'note'){
          this.spliceSeq('notes', rest[0], this.noteRef, rest[1] )
        }
      }
      else if(e === 'reOrdered'){
        this.props.listener(this.state.newSeq, 'i', this.props.module, 'reseq')
        this.setState(state => {
          state.clips[state.currentSeq] = this.state.newSeq;
          return state})
      }
      else if (e === 'identify')
      {
        let name = this.state.clipSettings[rest[0]][2]
        returnVal = name
        
      }
      else if(e === 'delete'){
        props.listener(rest[0], rest[1], props.module, 'delete' , this.state.editSeq ? 'edit' : null)
      }
      return returnVal
    }

    
    
    this.play = (id, t) => {
      //console.log(this.state.clipSettings[this.state.currentSeq]);
      let trigInfo = this.state.clipSettings[this.state.currentSeq][3]
      if (trigInfo != undefined){
        //console.log('chain: ' + id + ' ' + t +' ' + trigInfo[0]);
        if (t === trigInfo[0][2]){
          //console.log('to: ' + this.state.clipSettings[trigInfo[0][1]][2])
          this.doToClip(trigInfo[0][1], 'playClip')
        }
      }
      
      /**/
      this.setState({noteOn: true});
      //this.transportRef.current.state.noteOn = 't-note-on'
      this.props.playNote(id, this.props.freq[id])
    }
      
    this.clear = () => {
      this.setState({editSeq : false })
      this.props.clear(this.props.module)
    }

    this.tick = (t) => {
      //this.transportRef.current.setState({noteOn : this.state.noteOn ? 't-note-on' : 't-note-off'})
      if(this.state.seq.length > 0 ){
        let refInd = t
        this.noteRef[refInd].current.setState({noteCss : this.props.module +' note-on'})
        let x = t === 0 ? this.state.seq.length-1 : t-1
        let refIndP = x
        this.noteRef[refIndP].current.setState({noteCss : 'note-off'})
      }
    }
    
    this.playNextClip = () => {
      let nextClip = +this.state.currentSeq+1
      if (nextClip >= this.state.clips.length){
        nextClip = 0
      }
      if (nextClip < 0){
        nextClip = 0
      }

      this.doToClip(nextClip, 'playClip')
    }
  }
  
  componentWillReceiveProps(newProps){
    //console.log(this.state.clips);
    if(newProps.clips && newProps.clips.length > 0 ){
      this.setState({clips : newProps.clips})
    }

    if(newProps.seq && newProps.seq.length > 0 ){
      this.setState({seq : newProps.seq})
    }

    if (newProps.seq !== this.state.seq){
      this.setState({seq: [], swapSeq : newProps.seq})
      //console.log('clear ref');
      //console.log(this.noteRef);
    }
    
  }

  componentDidUpdate(prevProps){
    if(this.state.seq !== this.state.swapSeq){
      this.setState({seq:this.state.swapSeq})
    }
  }
  
  render(){
    return(
      <div className={`role ${this.props.module} ${this.state.active ? 'active' : 'inactive'}`}>
        <div id={this.props.module} onClick={this.props.modeClick} className='key-inner ins-header'>
          {`${this.props.module} ${this.state.realTime ? '(Realtime)' : '(Step)'} ${this.props.tempo} ${this.transportRef.current && this.transportRef.current.state.isPlaying ? 'Playing' : 'Stopped'} `}
          {`${this.state.editSeq ? 'editing: ' + this.composer.current.state.clipSettings[this.state.currentSeq][2] : 'new sequence'}, Source: ${this.state.sourceBankModule}, Target: ${this.state.targetBankInst}`} 
        </div>

        <div className="messages">
          MSG: {this.state.currentOp}
        </div>
        
        <div id={this.props.module+'-clips'} className='sequence-collection'
             onDragEnter={this.patternBar}
             onDragLeave={this.patternBar}>
              { this.state.clips.length > 0 && this.composer.current.state.clipSettings != undefined ? 
                this.state.clips
                .map((o, i)=>
                     <ClipEdit
                       ref={this.clipRefMake(i)}
                       storePayload = {this.storePayload}
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
                <div style={{textAlign:'left'}} className='messages'>CLIP</div>
              }
            </div>
            
        <div className='ins' style={{display : this.state.visible ? 'block' : 'none'}}>
          <div id={this.props.module+ '-notes'} className='note-collection'
               onDragEnter={this.sequenceBar}
               onDragLeave={this.sequenceBar}>
            { this.state.seq.length > 0 ?
              this.state.seq
              .map((o, i) =>
                   <SeqEdit
                     ref={this.noteRefMake(i)}
                     storePayload = {this.storePayload}
                     trigs = {this.state.clipSettings[this.state.currentSeq] != undefined && this.state.clipSettings[this.state.currentSeq][3] != undefined ? this.state.clipSettings[this.state.currentSeq][3] : [] }
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
                Rename clip:
                <input id='rename-a-clip'
                       className='text-input'
                       value={this.state.currentPatternName}
                       onKeyUp={this.clipNameEdit}
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
            module={this.props.module}
            tick={this.tick}
            tempo={this.props.tempo}
            seq={this.props.seq}
            cue={this.props.cue}
            play={this.play}
            start={this.state.scheduleStart}
            clipListener={this.clipListener}
            playNextClip={this.playNextClip}
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

