import React, { Component } from 'react'
import './Keys.css'
import { KeyboardState } from '../Keyboard/KeyboardState'
import { EngineContext } from '../Engine/EngineContext'

//beat detector
class Keys extends Component {
  constructor(props){
    super()
    this.state = {
      button: false,
    }
    
    this.props = props;

    this.press = () => {
      this.props.playNote(this.props.index, this.props.obj.freq)
      props.listener(this.props.index, 'add');
      this.props.obj.noteOn = true;
    }

    this.pressRelease = () => {
      this.props.obj.active.map &&
      this.props.listener(this.props.index);
      this.props.obj.noteOn = false;
    }
  }
  componentDidUpdate(){
    
  }
  render(){
    return(
      <EngineContext.Consumer>
        {engine => (
          <div
	    className = {
	      'key ' +
                (this.state.button ? 'hardware' : '') + ' ' +
		this.props.obj.type + ' ' +
		this.props.view  + ' ' +
	        Object.keys(this.props.obj.active).join(' ') + ' ' +
	        (engine.noteOn[0] === this.props.index ? engine.noteOn[1] : 'note-off')}
	  //onMouseDown = {this.press}
          //onTouchStart = {this.press}
            onClick = {this.press}
	    style = {
	      this.props.view === 'logarithmic' ?
		{width : 11*1/Math.pow(2, (this.props.widget)/12)+'%'}
	      : {}
	    }>
	    
            <div className='key-inner'>
              <div className='key-text'>
                <div>
		  {Math.round(this.props.obj.freq)}Hz <br/>
                  {this.props.index} <br/>
                  {this.props.obj.nom} {this.props.obj.type === 'black-key' ? '#' : ''}  <br/>
                  {this.props.obj.type === 'white-key' ? this.props.obj.pos % 7 + 1 : ''} <br/>
                  <div className="qwert">{this.state.qwert}</div>
		</div>
              </div>
            </div>
          </div>)}
        </EngineContext.Consumer>
    )
  }
}
export default (Keys)


