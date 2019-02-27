function Sequencing(props){

  var startTime = 0;

  this.arpTimerBuffer = [];
  this.triggerTimerBuffer = [];
  this.arpTriggerTimerBuffer = [];

  this.startSequencer = () => {
    this.props.setTempo(this.state.tempo)
    let arpTimer = setInterval(() => {
      if(this.arpTimerBuffer.indexOf(arpTimer) === -1)this.arpTimerBuffer.push(arpTimer);
      this.procNotes();
      this.setState({arpTimer : this.arpTimerBuffer.length + ', ' + this.arpTriggerTimerBuffer.length, timer: startTime++, isPlaying: true})
    }, 60000/this.state.tempo)
  }


  var arpCount = -1;
  var restCount = -1;
  this.arpeggiate = () => {
    //this.props.setTempo(this.state.tempo)
    this.createOsc(this.props.noteOn[1], this.props.noteOn[0])
    let buffer = this.arpTriggerTimerBuffer
    let singleNoteTimer = setTimeout(() => {
      clearInterval(singleNoteTimer)
    }, (60000/this.state.tempo))
    restCount++;
    arpCount++;
    if (restCount == this.state.arpFreq){restCount = 0}
    if (restCount == 0){arpCount = 0}
    if(Object.keys(this.props.activeNotes).length > 0) {
      if (arpCount < this.state.arpRepeats){
        let arpTriggerTimer = setInterval(() => {
	  if(buffer.indexOf(arpTriggerTimer) === -1)buffer.push(arpTriggerTimer)
          let res = this.genPlayer(this.props.activeNotes).next().done;
          if(res) {
	    buffer.forEach((t)=>clearInterval(buffer.pop()))
          }
        }, 60000/this.state.tempo/this.state.arpExpand) }
    }
  }

  var j = 0;
  this.genPlayer = function* (obj){
    while(j < Object.keys(obj).length){
      console.log(j);
      yield this.createOsc(obj[Object.keys(obj)[j]] , Object.keys(obj)[j++]);
    }
    j = 0;
    console.log(j);
    yield this.createOsc(obj[Object.keys(obj)[j]] , Object.keys(obj)[j++]);
    
    return true
  }

  this.stopSequencer = () => {
    this.arpTimerBuffer.forEach((o) => {clearInterval(this.arpTimerBuffer.pop())})
    this.arpTriggerTimerBuffer.forEach((o) => {clearInterval(this.arpTriggerTimerBuffer.pop())})
    this.setState({timer: startTime++, isPlaying: false})
  }

  this.clear = () => {
    this.stopSequencer()
    this.props.clear()
    this.setState({autoStart: true, arpTimer: this.arpTimerBuffer.length + ', ' + this.arpTriggerTimerBuffer.length})
  }

  this.changeTempo = () => {
    //const tempo = this.state.tempo * this.state.arpContract;
    //this.setState({tempo : tempo})
    if(!this.state.trigger) {this.startSequencer()}
  }

  this.trigNote = () => {
    this.arpTriggerTimerBuffer.forEach((o) => {clearInterval(this.arpTriggerTimerBuffer.pop())})
    this.arpeggiate()
  }

  var i = 0;
  this.keyArr = [];
  var note;

  this.procNotes = () => {
    this.keyArr = Object.keys(this.props.activeNotes)
    if(this.keyArr.length > 0){
      note = this.props.activeNotes[this.keyArr[i]];
      !isNaN(note) ? this.playNote(note).next() : i--;
    }
    
  }
  var id;
  this.playNote = function*(hz){
    id = i
    i < this.keyArr.length-1  ? i++ : i = 0;
    yield this.createOsc(hz, this.keyArr[id])
  }

  
  this.slideArp = (e, o) =>  {
    this.stopSequencer();
    //this.props.setTempo(this.state.tempo)
    switch (o.name){
    case 'arpFreq': this.setState({arpFreq: o.value});
      break;
    case 'arpRepeats': this.setState({arpRepeats: o.value});
      break;
    case 'arpExpand': this.setState({arpExpand: o.value});
      break;
    case 'arpContract': this.setState({arpContract: o.value});
      break;
    }
  }
  return (<div>
          <div>
              <div>Steps {this.state.timer}</div>
            </div>
            <div>Notes</div>{ Object.keys(this.props.activeNotes).map((o)=>{ return this.props.keys[o].nom +', ' }) }
            <br/>
            <div>Frequency</div>
            <div type="number" min='0' max="10" value={this.state.arpFreq} name='arpFreq' onChange={this.slideArp} className="slider"  step='1' />
            <div>Repeats</div>
            <div type="number" min='0' max="10" value={this.state.arpRepeats} name='arpRepeats' onChange={this.slideArp} className="slider"  step='1' />
            <div>Arp tempo multiplier</div>
            <div type="number" min='1' max="10" value={this.state.arpExpand} name='arpExpand' onChange={this.slideArp} className="slider"  step='1' />
            <div>Tempo divider</div>
            <div type="number" min='1' max="10" value={this.state.arpContract} name='arpContract' onChange={this.slideArp} className="slider"  step='1' />
          </div>)
}
