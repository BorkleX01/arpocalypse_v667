import React,  { Component } from 'react'
class Detector extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
    }
    /*
      patternbank to patternbank
      defaults to move
      modifier to copy
      drop = confirm
      The Corresponding Clip should also be copied?
      in the dataTransfer or via storage retrieval?

      Touch modifier? Long touch?

      sequence to sequence
      defaults to move
      modifier to copy
      drop = confirm

      Dragging a clip to the keyboard will transpose it as you slide along the keyboard.
      The nature of the transposition can be configured by the keyboard.
      eg. a straight transposition up and down the standard keys
      eg. a transposition along the modes by 'panning' the keyboard (the root key stays fixed)
      what about dragging a noteOn over the keyboard? An inversion? 

      Dropping a clip on top of a noteOn defines that note as a trigger for that pattern
      Dropping a clip on top of a noteOn that belongs to it defines the start position?
      Dropping a noteOn on top of a clip prepares a start position trigget in that clip (which is adjusted by editing that clip)

      It seems like any note associated with a clip instructs that clip to play when the note plays
      A note dropped onto many clips across tracks will trigger all of them
      A note dropped onto many clips in the same track will...trigger them in order of appearance I suppose

      How a clip dropped onto many notes? 
      Each time the note plays a new spawn of that clip will play. All the configuration for that clip effects every spawn. 
      I suppose this can be used in cases where Frequency and Repeats don't help
      
    */

    
  }
  render(){
    return(<div>
             <div>Detector</div>
           </div>)
  }
}
export default Detector
