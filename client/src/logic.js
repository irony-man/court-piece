function decide() {
  
const deck = [{
  value: '10',
  suit: "club"
 },
 {
  value: '10',
  suit: "spade"
 },
 {
  value: '13',
  suit: "heart"
 },
 {
  value: '10',
  suit: "heart"
 }
];
const trump = 'clu';
const cur = 'spade';


let winner=0, t=0, c=0, con=0;
for (let i = 0; i < 4; i++) {
 if(deck[i].suit===trump){
  if(parseInt(deck[i].value)>=parseInt(deck[t].value)){
   t=i;
   ++con;
  }
 }
 if(deck[i].suit===cur){
  if(parseInt(deck[i].value)>=parseInt(deck[c].value)){
   c=i;
   winner=i;
  }
 }
 if(con!=0){
  winner=t;
 }
}
return winner;
}
//console.log(decide());

function makePlayers(i) {
  let arr=[], k=0;
  for (let j = 0; j < 4; j++) {
    k=i+j;
    if(k>3){
      k=k-4;
    }
    arr[j] = k;
  }
  return arr;
}

const p = makePlayers(0)

console.log(makePlayers(0));
console.log(makePlayers(1));
console.log(makePlayers(2));
console.log(makePlayers(3));
//console.log(p[1]);