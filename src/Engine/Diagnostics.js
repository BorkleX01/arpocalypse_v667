import React, { Component } from 'react'
import { Form, Container, Grid, Segment, Image, Divider, Loader, Label, Button, Icon, Dimmer, Header, Visibility, Ref} from 'semantic-ui-react'
class Diagnostics extends Component {
  constructor(props){
    super()
    this.state = {
      gain : 0.10,
      freqDefault: 440,
      part: 1000,
      logSlider : 0,
      toneInterval : 0.38,
      tempo: 135,
      timer: 0,
      floor: 16.35,
      ceil: /*7902*/ 1200,
      engineOn: false,
      osc: []
    }
    var audioCtx = props.ctx
    var gainNode = props.gain
    var oscillator
    console.log(audioCtx.state == 'running');
    this.state.engineOn = (audioCtx.state == 'running' ?  true : false);

    this.startTestEngine = () => {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.setState({engineOn: true})
      
    }

    this.pauseEngine = () => {
      audioCtx.suspend();
      this.setState({engineOn: false})
    }

    this.closeEngine = () => {
      this.setState({engineOn: false})
      audioCtx.close()
    }

    this.resumeEngine = () => {
      this.setState({engineOn: true})
      audioCtx.resume()
    }

    this.createOsc = () => {
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(this.state.gain, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      this.setState({osc : 'create'})
    }

    this.connectOsc = () => {
      oscillator.connect(gainNode);
      this.setState({osc : 'connect'})
    }

    this.startOsc = () => {
      oscillator.start();
      this.setState({osc : 'start'})
    }
    
    this.stopOsc = () => {
      oscillator.stop();
      gainNode.disconnect();
      this.setState({osc : 'stop'})
    }

    this.slideCeiling = (e) => {
      this.setState({ceil : e.target.value})
      if(oscillator){
        oscillator.frequency.setValueAtTime(e.target.value, audioCtx.currentTime);
      }
    }

    this.slideFloor = (e) => {
      this.setState({floor : e.target.value})
      if(oscillator){
        oscillator.frequency.setValueAtTime(e.target.value, audioCtx.currentTime);
      }
      
    }

    this.slidePart = (e) => {
      this.setState({part : e.target.value})
      //oscillator.frequency.setValueAtTime(e.target.value, audioCtx.currentTime);
    }
  }
  render(){
    return(
      <Segment>
        <Segment>
          <Header>Audio Context</Header>
          <Button onClick={this.props.startEngine}>START</Button>
          <Button onClick={this.closeEngine}>CLOSE</Button>
          <Button onClick={this.pauseEngine}>SUSPEND</Button>
          <Button onClick={this.resumeEngine}>RESUME</Button>
        </Segment>
        <Divider/>
        {this.state.engineOn ? 
          (<Segment>
            <Header>Oscillator Node</Header>
            <Button onClick={this.createOsc}>CREATE</Button>
            <Button onClick={this.connectOsc}>CONNECT</Button>
            <Button onClick={this.startOsc}>START</Button>
            <Button onClick={this.stopOsc}>STOP</Button>
            <Segment>{this.state.osc}</Segment>
          </Segment>)
          : 
         <Segment>Diagnostic Audio Context Off</Segment>}
        <Label> Freq range </Label>
        <Label>{this.state.toneInterval}</Label>
        <Label>{this.state.floor}</Label> Floor
        <Form.Input type="range" min="0" value={this.state.floor} max={this.state.part}  className="slider" onChange={this.slideFloor} />

        <Label>{this.state.part}</Label> Partition
        <Form.Input type="range" min='30' max="3999" value={this.state.part} className="slider" onChange={this.slidePart}  />

        
        <Label>{this.state.ceil}</Label> Ceiling
        <Form.Input type="range" min={this.state.part} value={this.state.ceil} max='4000'  className="slider" onChange={this.slideCeiling} />
        
      </Segment>

    )
  }
}
export default (Diagnostics)
