import React,  { Component } from 'react'
import { Keys } from '../Keys'
import './Keyboard.css'
import { keys } from '../Scale/Diatonic'
import { Role }  from '../Role'
import { EngineContext } from '../Engine/EngineContext'

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
      bass: {},
      treble: {},
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
	      nom: this.state.nom[pos-1],
              active: []}
    })
    
    this.state.keyObj = {...keyObj}
    this.state.keyArr = keyObj
    
    this.keyListener = (key, ...rest) => {
      if(rest.includes('add')){
        this.setState(state=>{
          state[state.mode] =  {...state[state.mode], [Object.keys(state[state.mode]).length] : key };
          state.keyObj[key].active[state.mode] = 0;
          return state
        })
      }
      
    }
    
    this.clearSeq = (mode) => {
      this.setState(state=>{
        for(let key of Object.values(state.keyObj)){key.active[mode] != undefined && delete key.active[mode]}
        state[mode] = {}
        return state
      })
    }

    this.roleListener = (v, i, mode) => {
      delete this.state[mode][i] 
      this.setState(state=>{
        Object.values(state[mode]).includes(+v) !== true && delete state.keyObj[v].active[mode]
        return state
      })
    }
    
    this.viewClick = (e) => {
      this.setState({view: e.target.name})
    }
    
    this.modeClick = (e) => {
      console.log(e.target.name);
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
	        <button className='bass' onClick={this.modeClick} name='bass'>Bass</button>
	        <button className='treble' onClick={this.modeClick} name='treble'>Treble</button>
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
			 module='bass'
			 listener={this.roleListener}
			 freq={this.state.freq}
			 seq={this.state.bass}
			 playNote={engine.playNote}
	                 tempo={engine.tempo} />

	               <Role
			 clear={this.clearSeq}
			 module='treble'
			 listener={this.roleListener}
			 freq={this.state.freq}
			 seq={this.state.treble}
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
