export var a4 = 440;  
const freq = a4/16
function getFreq(i){
  return freq * Math.pow(2, i/12)
}

export function frequencies(oct){
  let freqArr = []
  for (let i = 3; i < oct*12+3 ; i++){
    freqArr.push(getFreq(i))
  }
  return freqArr
}


