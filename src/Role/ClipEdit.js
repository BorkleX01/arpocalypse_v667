import React,  { Component } from 'react'
export default class ClipEdit extends Component {
  constructor(props){
    super()
    this.state = {
      name : '',
      value : '',
      id : '',
      isStart : false,
      isEnd: false,
      noteCss: 'note-off',
      shiftCss: 'init',
      statusCss: 'init',
      rank: -1
    }

    this.props = props

    this.state.name = this.props.name
    this.state.value = this.props.value
    this.state.id = this.props.id
    this.state.rank = this.props.rank

    this.widgetRef = React.createRef();
    this.swapMaybe = -1;

    this.dragStart = (e) => {
      e.dataTransfer.setData("text/plain", [this.props.instrument,this.props.patch, this.state.rank, this.state.value]);
      e.dataTransfer.effectAllowed = "all";
      this.props.listener('declareDrag', this.state.rank)
    }
    
    this.dragEnter = (e) => {
      e.preventDefault();
      this.swapMaybe = e.target.id;
      this.props.listener('reOrder', this.state.rank, this.state.shiftCss)
    }

    this.dragLeave = (e) => {
      e.preventDefault();
      this.swapMaybe = e.target.id;
    }
    
    this.clipOver = (e) => {
      if (this.swapMaybe !== e.target.id){
        this.swapMaybe = e.target.id;
      } 
    }

    this.dragDrop = (e) => {
      e.preventDefault();
      this.props.listener('clipDrop', this.state.rank)
    }

    this.click = (e) => {
      e.preventDefault();
      this.props.listener(this.props.value)
    }
    
  }
  
  render(){
    return(<div
             ref = {this.widgetRef}
             draggable={"true"}
             onDragStart={this.dragStart}
             onDragEnter={this.dragEnter}
             onDragLeave={this.dragLeave}
             onDragOver={this.clipOver}
             onDragEnd={this.dragDrop}
             className={'frontdrop sequence-edit ' + this.state.noteCss + ' ' + this.state.shiftCss + ' ' + this.state.statusCss}
             onClick={this.click}
             id={this.state.value} >
             <button >
               <div className='cell-input'>{this.state.name}</div>
             </button>
           </div>)
  }
  
}
