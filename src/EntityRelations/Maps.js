import React,  { Component } from 'react'
class Maps extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
    }

    this.search = (origin, target) => {
      let result = 'no-mapping'
      
      if(origin.type === 'clip' && target.zone === 'sequence-collection')
      {result = {op:'reOrder', arg:'clip'}}
      
      if(origin.type === 'note' && target.zone === 'note-collection')
      {result = {op:'reOrder', arg:'note'}}
      
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
