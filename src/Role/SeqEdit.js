import React,  { Component } from 'react'
export default class SeqEdit extends Component {
  constructor(props){
    super()
    this.state = {
      value : 'rest',
      noteCss: 'note-off'
    }
    this.props = props;
    this.state.value = this.props.value
    this.state.id = this.props.id
    this.state.rank = this.props.rank
    
    this.clipClick = (e) => {
      this.props.listener(this.props.value)
    }

    this.clipOver = (e) => {
      e.preventDefault();
      console.log(this.state.rank);
      
    }

    this.dragStart = (e) => {
      console.log('dragging: ' + this.state.value + ' ' + this.state.id);
      e.dataTransfer.setData('text/plain',this.state.value);
      e.dataTransfer.effectAllowed = "all";
    }
    
  }
  render(){
    return(<div
             onClick={this.clipClick}
             onDragOver={this.clipOver}
             draggable={"true"}
             onDragStart={this.dragStart}
             className={'frontdrop role-edit ' + this.state.noteCss}>
             <button>
               {this.props.label}
             </button>
           </div>)
  }
}
