    var search = window.location.search.substring(1);
    var qStr = '';
    var querySeqArr;
    if (search != ''){qStr = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })}
    if (qStr != '') {
      console.log(qStr.seqNotes);
      if(qStr.seqNotes){
        querySeqArr = qStr.seqNotes.split(',') 
        this.state.seqArr = querySeqArr.reduce((acc, o, i) => {if(i%3 == 0) acc.push([o, querySeqArr[i+1]]); return acc},[])
        console.log(this.state.seqArr[0][0]);
        this.state.seqArr[0][0] != 'undefined' ? 
          this.state.seqArr.forEach((arr) => this.props.store(arr)) : console.log('no sequencer notes');
      }
    }
