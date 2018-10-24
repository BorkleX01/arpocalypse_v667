import React,  { Component } from 'react'
class Maps extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
    }

    this.search = (origin, target) => {
      //console.log(origin)
      //console.log(target)
      
      let result = {op: 'no mapping found', arg: 'no args'}

      if (origin.module === target.module){ //I don't have a solution for Chrome DataTransfer.getData() issue apart from use Redux
        
        if(origin.type === 'clip' && target.zone === 'sequence-collection' )
        {
          result = {op:'reOrder', arg:'clip'}
        }
        
        if(origin.type === 'note' && target.zone === 'note-collection' )
        {
          result = {op:'reOrder', arg:'note'}
        }

        if(origin.type === 'clip' && target.zone === 'note-collection' && target.id !== false)
        {
          result = {op:'triggerNote', arg:{origin, target}}
        }

        if(origin.type === 'note' && target.zone === 'sequence-collection' && target.id !==false)
        {
          result = {op:'triggerClip', arg:{origin, target}}
        }
      }
      
      return result
    }
  }
  render(){
    return(<div>
             <div>Maps</div>
           </div>)
  }
}
export default Maps
