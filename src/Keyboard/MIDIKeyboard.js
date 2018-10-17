class MIDI {
  constructor() {
    console.log('MIDI interface constructed');

    this.stateListener = (transferFunction) => {
      this.reportBPM = transferFunction
      navigator.requestMIDIAccess()
        .then(mdnMidiMethod);
    }


    var mdnMidiMethod = (access) => {
      const inputs = access.inputs.values();

      for (let obj of inputs){
        console.log('Inputs: ' + obj.name + ' ' +obj.state);
        obj.onstatechange = detectStateChange
        obj.onmidimessage = detectMidiMessage
      }
       
      
      var detectStateChange = (e) => {
        console.log('MIDIInput state change');
        console.log(e.port.name + ' ' + e.port.state);
      }

      var clockSignalCounter = 0
      var t1 = performance.now()

      //Why won't this work as an arrow function?
      var passBPM = (bpm) => {
        this.reportBPM(bpm)
      }
      function detectMidiMessage (e) {
        //console.log(e.data[0] + ' ' + e.data[1] + ' ' + e.data[2])
        if (e.data[0] === 248){

          if (clockSignalCounter < (24-1)){
            clockSignalCounter++
          }
          else
          {
            clockSignalCounter = 0
            var t2 = performance.now()
            let beat = t2-t1
            let bpm = 60000/beat
            //console.log('clock tick: ' + beat + ' ' + bpm);
            passBPM(bpm)
            t1 = performance.now()
          }
        }
      }


      access.onstatechange = function(e) {
        // Print information about the (dis)connected MIDI controller
        console.log('MIDIAccess state change');
        console.log(e);
        console.log(e.port.name)
        console.log(e.port.state)
        
      }
    }
  }
}
export { MIDI }



