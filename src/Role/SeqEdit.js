import React,  { Component } from 'react'
export default class SeqEdit extends Component {
  constructor(props){
    super()
    this.state = {
      value : 'rest',
      css: 'note-off'
    }
    this.props = props;
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
      console.log('dragging: ' + this.state.value + ' ' + this.state.id);
      e.dataTransfer.setData('text/plain',this.state.value);
      e.dataTransfer.effectAllowed = "all";
    }
    
  }
  render(){
    return(<div
             onDragOver={this.clipOver}
             draggable={"true"}
             onDragStart={this.dragStart}
             className={'frontdrop role-edit ' + this.state.css}>
             <button>
               {this.props.label}
             </button>
           </div>)
  }
}
