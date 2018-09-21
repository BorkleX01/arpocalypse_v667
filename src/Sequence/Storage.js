import React,  { Component } from 'react'
class SaveSequence extends Component{
  constructor(props){
    super();
    this.state = {
      clips: []
    }
    console.log(process.env.NODE_ENV);
    var storageServer = process.env.NODE_ENV === "development" ? 'http://lunatropolis.com/arp-save.php' : '../arp-save.php';
    console.log(storageServer);
    this.saveSeq = () => {
      
      if(this.props.seq){
        let clip = [];
        let thisSeq = this.props.seq;

        thisSeq.map((o,i)=>clip.push([this.props.seq[i], this.props.cue[i], this.props.recTempo]))
        
        this.setState(state => {state.clips = [...state.clips, clip]
                                this.props.clipListener()
                                this.props.clear()
                                console.log(state.clips);
                                console.log(this.props.module);
                                return state})
      }
      
      let req = new XMLHttpRequest();
      let fData = new FormData();
      fData.set('action', 'write')
      fData.set('config', JSON.stringify({ "bogus" : 'XXXXX', "bogus2" : { "nestedX" : 'YYYY', "numberX" : 667 } }))
      req.open('POST', storageServer, true);
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {

        }
      }

      req.send(fData)

    }

    this.loadSeq = (e) => {
      let req = new XMLHttpRequest();
      let fData = new FormData();
      fData.set('action', 'read')
      req.open('POST', storageServer, true);
      req.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          let res = this.response;
          let obj = JSON.parse(res)

          console.log(obj);
          console.log(obj.bogus);
          console.log(obj.bogus2);
          console.log(obj.bogus2.nestedX);
          console.log(obj.bogus2.numberX);

        }
      }
      req.send(fData)

    }
  }

  componentDidUpdate(){
    
  }
  render(){
    return(
      <React.Fragment>
        <button onClick={this.saveSeq}>SAVE SEQ</button>
        <button onClick={this.loadSeq}>LOAD SEQ<br/>(Doesn't do anything yet)</button>
        
      </React.Fragment>
    )
  }
}

export {SaveSequence}
