import React,  { Component } from 'react'
export default class SeqEdit extends Component {
  constructor(props){
    super()
    this.state = {
      value : 'rest',
      patch : '',
      id : '',
      isStart : false,
      isEnd: false,
      noteCss: 'note-off',
      shiftCss: 'init',
      statusCss: 'init',
      rank: -1
    }
    this.props = props;
    this.state.value = this.props.value
    this.state.patch = this.props.patch
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
      this.props.listener('noteDrop', this.state.rank)
    }
    
    this.click = (e) => {
      this.props.listener('delete' , this.props.value, this.props.rank)
      
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
             onClick={this.click}
             className={'frontdrop role-edit ' + this.state.noteCss+ ' ' + this.state.shiftCss + ' ' + this.state.statusCss}>
             <button>
               {this.props.label}
             </button>
           </div>)
  }
}
