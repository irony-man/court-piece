var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
var suits = ["spades", "hearts", "diamonds", "clubs"];
var deck = [];
const Player1 = [];
const Player2 = [];
const Player3 = [];
const Player4 = [];
let card = [];


for (let i = 0; i < suits.length; i++) {
 for (let x = 0; x < values.length; x++) {
  let card = { Value: values[x], Suit: suits[i] };
  deck.push(card);
 }
}

for (let i = deck.length - 1; i > 0; i--) {
 let j = Math.floor(Math.random() * i);
 let temp = deck[i];
 deck[i] = deck[j];
 deck[j] = temp;
}
let k=0;
for (let i = 0; i < 4; i++) {
 k=13*i;
 for (let j = 0; j<13; j++) {
  if(i===0)
  Player1[j]=deck[k];
  if(i===1)
  Player2[j]=deck[k];
  if(i===2)
  Player3[j]=deck[k];
  if(i===3)
  Player4[j]=deck[k];
  k++;
 }
}

for (let i = 0; i < 4; i++) {
 if(i===0)
 Player1.sort(sorting);
 if(i===1)
 Player2.sort(sorting);
 if(i===2)
 Player3.sort(sorting);
 if(i===3)
 Player4.sort(sorting);
 
 function sorting(a, b) {
 var A = a.Suit;
 var B = b.Suit;
 if (A < B) {
  return -1;
 }
 if (A > B) {
  return 1;
 }
 return 0;
}
}
card=Player1;

export default card;