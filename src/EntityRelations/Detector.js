/*
  patternbank to patternbank
  defaults to move
  modifier to copy
  drop = confirm
  The Corresponding Clip should also be copied?
  in the dataTransfer or via storage retrieval?

  sequence to sequence
  defaults to move
  modifier to copy
  drop = confirm

  Touch modifier? Long touch?

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

  How about dragging keys from the keyboard onto a pattern or a sequence?
  
  Does the dial spinner belong here?

  Keyboard slides
  Guitar strum mode
  ie dragfrom key to key
*/
import React,  { Component } from 'react'
class Detector extends Component {
  constructor(props, state){
    super()
    this.props = props
    this.state = {
      messages : '',
      source: '',
      target: '',
      id:''
    }
    console.log('Detector has access to:  ');
    console.log(props, state);
    
    this.diag = (arg) => console.log('Detector Up: ' + arg);

    let assoc = new WeakMap();
    
    this.query = (typeStr, obj) => {
      let data = obj.split(',')
      console.log(typeStr +' '+ data);
      var origin = data[1]
      var type = data[0]
      var id = data[2]
      var target

      type = data[0]

      if(typeStr === 'declareDrag'){
        origin = data[1]
      }

      if(typeStr === 'dragEnter'){
        target = data[1]
      }

      if(typeStr === 'dragleave'){
        target = undefined
      }

      if(typeStr === 'onDrop'){
        target = data[1]
      }
      console.log(origin, type, id, target);
    }
    
  }
  
  render(){
    return(<div className='panel'>
             <div>Connections</div>
             <div className='messages'>{this.state.messages}</div>
           </div>)
  }
}
export default Detector
