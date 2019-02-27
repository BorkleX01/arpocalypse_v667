import { frequencies } from '../Tuning/Standard'
const major = {c : 1, d : 1 , e : 0.5 , f : 1, g : 1, a : 1, b : 0.5}
const majors = Object.values(major)
var names = Object.keys(major)

var pos = -1
function* genNote(){
  pos = pos > 5 ? pos = 0 : pos+1
  yield names[pos]
}

function generateRange(octs) {
  console.log('generateRange');
  let ratio=0
  let note =[]
  let wholes=[]
  let semis= []
  let intervals = []
  let nomenclature = []
  let oct = 0
  let position = []
  while (oct < octs){ 
    majors.forEach((interval, i) => {
      position.push(oct*8+i) ;
      ratio = ratio+interval ;
      intervals.push(interval);
      nomenclature.push(genNote().next().value+(oct+1));
      if(interval === 1){ semis.push(position[position.length-1]) ; note.push(interval-0.5) }
      wholes.push(position[position.length-1]) ; note.push(interval) ;
      
    })
    oct++
  }
  let freq = frequencies(octs)
  return { position, note, wholes, semis, intervals, nomenclature, freq}
}

export function keys(octs){
  return generateRange(octs)
}


