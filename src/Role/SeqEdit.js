/* merge this with ClipEdit. ElementEdit class. */
import React,  { Component } from 'react'
export default class SeqEdit extends Component {
  constructor(props){

    super()
    this.props = props;
    this.state = {
      value : 'rest',
      patch : '',
      id : '',
      isStart : false,
      isEnd: false,
      noteCss: 'note-off',
      shiftCss: 'init',
      statusCss: 'init',
      rank: -1,
      trigs: []
    }


    this.state.value = this.props.value
    this.state.patch = this.props.patch
    this.state.id = this.props.id
    this.state.rank = this.props.rank
    //this.widgetRef = React.createRef();
    this.swapMaybe = -1;

    if(this.props.trigs[0] != undefined && this.props.trigs[0][2] === this.props.id){
      console.log('triggers marked here: ');
      let targ = this.props.listener('identify', this.props.trigs[0][1][0])
      if (targ !== 'not-found'){
        this.state.trigs = targ
      } else
      {
        console.log('Not found : ' + this.props.trigs[0][1][0])
        this.state.trigs = []
      }
    }

    this.dragStart = (e) => {
      e.dataTransfer.setData(
        //Chrome security won't allow getData to be called except on 'drop' so I can't use this for drag listeners
        "text/plain",
        ['note',
         this.props.instrument,
         this.props.id,
         this.state.rank,
         this.state.value]);

      this.props.storePayload (
        ["text/plain",
        ['note',
         this.props.instrument,
         this.props.id,
         this.state.rank,
         this.state.value]
        ])
      
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
      this.props.listener('drop', this.state.rank)
    }
    
    this.click = (e) => {
      this.props.listener('delete' , this.props.value, this.props.rank)
      
    }
    
  }

  componentDidUpdate(prevProps){
    //console.log(this.state.trigs);
  }

  render(){
    return(<div
             //ref = {this.widgetRef}
             draggable={"true"}
             onDragStart={this.dragStart}
             onDragEnter={this.dragEnter}
             onDragLeave={this.dragLeave}
             onDragOver={this.clipOver}
             onDragEnd={this.dragDrop}
             onClick={this.click}
             className={'frontdrop role-edit ' + this.state.noteCss + ' ' + this.state.shiftCss + ' ' + this.state.statusCss}
             id = {this.state.id}>
             <button>
               {this.props.label}
             </button>
             <div className='trigger-marker'>
               {this.state.trigs}
             </div>
           </div>)
  }
}
