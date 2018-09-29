import React,  { Component } from 'react'
export default class ClipEdit extends Component {
  constructor(props){
    super()
    this.state = {
      name : '',
      value : '',
      id : ''
    }

    this.props = props

    this.state.name = this.props.value
    this.state.value = this.props.value
    this.state.id = this.props.id
    
    this.clipClick = (e) => {
      this.props.listener(this.props.value)
    }

    this.changeName = (e) => {
      console.log('context');
      e.preventDefault();
      //this.setState({name: e.target.value})
    }
  }
  
  render(){
    return(
      <button value={this.state.value} onClick={this.clipClick} >
        <div className='cell-input'>{this.state.name}</div>
      </button>
    )
  }
  
}
