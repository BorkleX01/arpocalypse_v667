import React,  { Component } from 'react'
import { Keys } from '../Keys'
import './Keyboard.css'
import { keys } from '../Scale/Diatonic'
import { Role }  from '../Role'
import { EngineContext } from '../Engine/EngineContext'
import { KeyboardState } from '../Keyboard/KeyboardState'

class Keyboard extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
      range : props.range,
      view : 'piano',
      mode : 'bass',
      notes: [],
      freq: [],
      intervals: [],
      keyArr: [],
      keyObj: {},
      seqBass: [],
      seqMel: [],
      nom: [],
      time: 0,
    }

    const data = keys(8)
    this.state.notes = data.note
    this.state.freq = data.freq
    this.state.int = data.intervals
    this.state.nom = data.nomenclature
    
    var pos = 0;
    const keyObj = this.state.notes.map((o, i, arr) => {
      return {int: o,
	      pos: (o === 1 ? pos : pos++),
	      freq: this.state.freq[i],
	      type: (o === 0.5 ? 'white-key' : 'black-key'),
	      nom: this.state.nom[pos-1]}
    })
    
    this.state.keyObj = {...keyObj}
    this.state.keyArr = keyObj
    
    this.keyListener = (key, ...rest) => {
      console.log(key);
      if(rest.includes('add')){
	if(this.state.mode==='bass'){
	this.setState(state=>{
	  state.seqBass = [...state.seqBass, key]
	  state.keyObj[key].active = state.seqBass.includes(key)?'bass':''
	  return state})}
	if(this.state.mode==='mel'){
	  this.setState(state=>{
	    state.seqMel = [...state.seqMel, key]
	  state.keyObj[key].active = state.seqMel.includes(key)?'mel':''
	  return state})}
	}
    }
    
    
    this.clearSeq = () => {
      for (let i in this.state.keyObj){this.state.keyObj[i].active = ''};
      this.state.mode==='bass' ? this.setState({seqBass : []}) : this.setState({seqMel : []})
    }

    this.roleListener = (v, i) => {
	    
      let newArr = this.state.mode==='bass'? this.state.seqBass : this.state.seqMel;
      newArr.splice(i, 1);
      this.setState(state=>{
	state[state.mode==='bass'?'seqBass':'seqMel'] = newArr,
	state.keyObj[v].active = newArr.includes(+v) ? state.mode==='bass'?'bass':'mel':'none'
	return state})
    }
    
    this.viewClick = (e) => {
      this.setState({view: e.target.name})
    }
    this.modeClick = (e) => {
      this.setState({mode: e.target.name})
    }
  }
  
  render() {
    return this.state.keyArr.length > 0 && (
      <EngineContext.Consumer>
	{engine =>(
          <div className='keyboard-outer'>
            <div className='lhs-tabs'>
              <button onClick={this.viewClick} name='piano'>Piano</button>
              <button onClick={this.viewClick} name='squares'>Grid</button>
              <button onClick={this.viewClick} name='squares octave'>Octave</button>
              <button onClick={this.viewClick} name='logarithmic'>Logarithmic</button>
            </div>
	    <div className='rhs-tabs'>
	      <button onClick={this.modeClick} name='bass'>Bass</button>
	      <button onClick={this.modeClick} name='mel'>Melody</button>
	    </div>
            <div className='keyboard'>

	      {Object.keys(this.state.keyObj)
		.map((o,i,arr)=>(
		this.props.range[0] <= i
		&&
		i <= this.props.range[1]
		&&
		(<Keys
		     key={i-this.props.range[0]}
		     widget={i-this.props.range[0]}
		     listener={this.keyListener}
		     view={this.state.view}
		     index={i}
		     obj = {this.state.keyObj[o]}
		     />
		)))}


	          <br/>
		     <div className='instruments'>
		       <Role
			 clear={this.clearSeq}
			 module={this.state.mode}
			 listener={this.roleListener}
			 freq={this.state.freq}
			 seq={this.state.seqBass}
			 playNote={engine.playNote}
	                 tempo={engine.tempo} />
	                <Role
			 clear={this.clearSeq}
			 module={this.state.mode}
			 listener={this.roleListener}
			 freq={this.state.freq}
			 seq={this.state.seqMel}
			 playNote={engine.playNote}
			 tempo={engine.tempo} />
		     </div>
            </div>
            <br/>
            </div>)}
      </EngineContext.Consumer>
    )
  }
}

export default Keyboard
