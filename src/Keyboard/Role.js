import React,  { Component } from 'react'
import { Container, Segment, Label, Header, Grid, Input, Button, Icon, Pagination,  Ref, Image, Menu, Form} from 'semantic-ui-react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import actions from '../redux/actions'
import reducer from '../redux/reducers'
import { Keys } from '../Keys'
import css from './Keyboard.css'


class Role extends Component {
  constructor(props){
    super()
    this.props = props
    this.state = {
      isPlaying: false,
      tempo: 135,
    }

    var startTime = 0;
    this.stopSequencer = () => {
      clearInterval(this.timer)
      this.setState({timer: startTime++, isPlaying: false})
    }

    this.startSequencer = () => {
      if (!this.state.isPlaying){
        this.timer = setInterval(() => {
          this.procNotes(startTime);
          this.setState({timer: startTime++, isPlaying: true})
        }, 60000/this.state.tempo)
      }
    }

    this.procNotes= () => {
      console.log(this.seqArr);
    }
  }
  componentWillMount(){
    if(!this.state.isPlaying){ this.startSequencer() }
  }
  render() {
    //const seqLength = Object.keys(this.props.seq).length
    return(
      <Container className='role'>
        <Button>START SEQ</Button>
        <Button>STOP SEQ</Button>
        <Segment style={{width: '100%'}}>{
            this.props.seqArr.length > 0 ?
            this.props.seqArr.map((o) => <Button>{o}</Button>)
            :
            'NO SEQUENCE'
          }
        </Segment>
      </Container>
    )}
}

const mapStateToProps = function (state) {
  return {
    seqArr : state.seqArr,
    state : state.getState
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    noteInfo : (i, cssClass) => dispatch(actions.app.highlightNote(i, cssClass))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Role)
