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
      noteCss: '',
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
    

    this.dragEnter = (e) => {
      e.preventDefault();
      this.swapMaybe = e.target.id;
      //console.log('enter ' + e.target.id);
      this.props.listener('reportDrag', this.state.rank, this.state.name)
      //console.log(e.target.getBoundingClientRect().left);
    }

    this.dragLeave = (e) => {
      e.preventDefault();
      this.swapMaybe = e.target.id;
      //console.log('leave ' + e.target.id);
      //this.props.listener('reportDrag', this.state.rank, this.state.name)
      //console.log(e.target.getBoundingClientRect());
    }
    
    this.clipClick = (e) => {
      e.preventDefault();
      this.props.listener(this.props.value)
    }

    this.clipOver = (e) => {
      e.preventDefault();
      if (this.swapMaybe !== e.target.id){
        this.swapMaybe = e.target.id;
      } 
      
      //console.log(e.target.getBoundingClientRect().left);
    }

    this.dragStart = (e) => {
      e.dataTransfer.setData("text", this.state.rank);
      e.dataTransfer.effectAllowed = "all";
      this.props.listener('regDrag', this.state.rank)
      this.props.listener('reportDrag', this.state.rank)
      console.log('start ' + this.state.name)
    }

    this.dragDrop = (e) => {
      this.props.listener('clipDrop', this.state.rank)
    }
  }
  
  render(){
    return(<div
             ref = {this.widgetRef}
             onDragDrop={this.dragDrop}
             onDragEnd={this.dragDrop}
             draggable={"true"}
             onDragStart={this.dragStart}
             onDragEnter={this.dragEnter}
             onDragLeave={this.dragLeave}
             onDragOver={this.clipOver}
             className={'frontdrop sequence-edit ' + this.state.noteCss + ' ' + this.state.shiftCss + ' ' + this.state.statusCss}
             onClick={this.clipClick}
             id={this.state.value} >
             <button >
               <div className='cell-input'>{this.state.name}</div>
             </button>
           </div>)
  }
  
}
