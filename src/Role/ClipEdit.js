import React,  { Component } from 'react'
export default class ClipEdit extends Component {
  constructor(props){
    super()
    this.state = {
      name : '',
      value : '',
      id : '',
      isStart : false,
      isEnd: false
    }

    this.props = props

    this.state.name = this.props.name
    this.state.value = this.props.value
    this.state.id = this.props.id
    this.state.key = this.props.key
    this.state.rank = this.props.rank
    let prevRank = this.state.key
    
    this.clipClick = (e) => {
      this.props.listener(this.props.value)
    }

    this.clipOver = (e) => {
      e.preventDefault();
      console.log(this.state.rank);
      if (this.state.rank < prevRank){
        console.log('shift right')
      }
      else
      {
        console.log('shift left')
      }
    }

    this.dragStart = (e) => {
      //console.log('dragging: ' + this.state.value + ', ' + this.state.id);
      let thisObj = this.state.value
      console.log(thisObj);
      e.dataTransfer.setData("text", thisObj);
      e.dataTransfer.effectAllowed = "all";
    }
  }
  
  render(){
    return(<div
             onDragOver={this.clipOver}
             draggable={"true"}
             onDragStart={this.dragStart}
             className='frontdrop sequence-edit'
             onClick={this.clipClick}
             id={this.state.value} >
             <button >
               <div className='cell-input'>{this.state.name}</div>
             </button>
           </div>)
  }
  
}
