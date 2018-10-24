/* merge this with SeqEdit. ElementEdit class. */
import React,  { Component } from 'react'

import { Detector } from '../EntityRelations'

export default class ClipEdit extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
      name : this.props.name,
      value : this.props.value,
      id : this.props.id,
      isStart : false,
      isEnd: false,
      playingCss: 'not-playing',
      shiftCss: 'init',
      statusCss: 'init',
      rank: this.props.rank
    }

    this.props = props
    
    //this.state.name = this.props.name
    //this.state.value = this.props.value
    //this.state.id = this.props.id
    //this.state.rank = this.props.rank

    this.widgetRef = React.createRef();
    this.swapMaybe = -1;

    //console.log(this.state.value);
    //console.log(this.state.id);
    
    this.dragStart = (e) => {
      
      e.dataTransfer.setData(
        //Chrome security won't allow getData to be called except on 'drop' so I can't use this for drag listeners
        //Also, I can't delete this callback, drags stop working
        'text/plain',
        ['clip',
         this.props.instrument,
         this.props.id,
         this.state.rank,
         this.state.value]);

      this.props.storePayload (
        ['text/plain',
        ['clip',
         this.props.instrument,
         this.props.id,
         this.state.rank,
         this.state.value]])

      e.dataTransfer.effectAllowed = "all";
      this.props.listener(e, this.state.rank, 'declareDrag')
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
      //console.log('dragDrop');
      this.props.listener('drop', this.state.rank)
    }

    this.click = (e) => {
      e.preventDefault();
      this.props.listener(this.state.value, 'ClipEditClick') //any abstracted widget should call parent function as a default
    }
    
  }
  componentDidUpdate(){
    //console.log(this.state.name)
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
             className={'frontdrop sequence-edit ' + this.state.playingCss + ' ' + this.state.shiftCss + ' ' + this.state.statusCss}
             id = {this.state.id}>
             <button >
               <div className='cell-input'>{this.state.name}</div>
             </button>
           </div>)
  }
  
}
