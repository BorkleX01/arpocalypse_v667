import React,  { Component } from 'react'
import './widgets.css'

export default class Spinner extends Component{
  constructor(props){
    super()
    this.state = {
      value: (o)=>{},
      step: 1,
      min: 1,
      max: 10,
      onChange: (e)=>{},
      fit: 'default',
      label: '',
      slider: true
    }

    this.props = props;
    Object.assign(this.state, this.props)
    
    this.arrowClick = (e) => {
      console.log(this.state.max);
      let inc = e.currentTarget.id === 'left' ? -1 * this.state.step : +1 * this.state.step;
      if((this.state.value + inc >= this.state.min) && (this.state.value + inc <= this.state.max)){
        this.setState({value: +this.state.value + inc})
        this.onChange(+this.state.value + inc)
      }
    }

    this.slideDrag = (e) => {
      let val = +e.currentTarget.value
      this.setState({value: val})
      this.onChange(val)
    }

    this.formClick = (e) => {
      this.setState({value : ''})
    }
    var valStr = '';
    this.formKeypress = (e) => {
      
      if(e.key !== 'Enter' && e.key !== 'Backspace' ) {
        let val = valStr+''+e.key;
        console.log(val);
        if (!isNaN(+val) || +val ==='.'){
          if(val => this.min && val <= this.max){
            this.setState({value : +val})
          }
          valStr = val;
        }
      }
      else if (e.key === 'Backspace')
      {

        valStr  = valStr.slice(0, -1)
        this.setState({value: valStr})
      }
      else if (e.key === 'Enter')
      {
        this.setState({value: +valStr})
        this.onChange(+valStr)
      }
      else
      {
        e.preventDefault()
      }
    }

    this.onChange = (v) => {
      if(!isNaN(+v)){
        this.props.onChange(+v)
      }
    }
  }

  render(){
    return(<div className="control">
             <div className="label">{this.state.label}</div>
             <div className="spinner" style={{}}>
               <div className="arrows arrow-left" id={'left'} onClick={this.arrowClick}>
                 <div className="icon">&larr;</div>
               </div>
               <div className="form">
                 <input
                   onClick={this.formClick}
                   onKeyDown={this.formKeypress}
                   value={this.state.value}
                   onChange={this.onChange}
                 />
               </div>
               <div className="arrows arrow-right" id={'right'} onClick={this.arrowClick}>
                 <div className="icon">&rarr;
                 </div>
               </div>
             </div>
           {this.state.slider === true && 
            (<input type="range"
                    min={this.state.min}
                    max={this.state.max}
                    value={this.state.value}
                    className="slider"
                    onChange={this.slideDrag}
                    step={this.state.step} />)}
           </div>
          )
  }
}
