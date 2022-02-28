import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import socket from '../socket';
import "./cardsren.css";

const Showcards = () => {
 const history = useHistory();
 const roomid= new URLSearchParams(window.location.search).get("room");
 const [cards, setCards] = useState([]);
 const [yourcard, setYourcard] = useState('');
 const [topname, setTopname] = useState('');
 const [rightname, setRightname] = useState('');
 const [leftname, setLeftname] = useState('');
 const [topcard, setTopcard] = useState('');
 const [rightcard, setRightcard] = useState('');
 const [leftcard, setLeftcard] = useState('');
 const [trumpcard, setTrumpcard] = useState('');
 const [playing, setPlaying] = useState(false);
 useEffect(()=>{
 socket.emit("roomid", roomid);
 },[]);
 socket.on("show-cards", all=>{
    const card = all.cards
    setCards([...card]);
    setTopname(all.top)
    setLeftname(all.left)
    setRightname(all.right)
 })
 function update(cur, imgurl) {
  socket.emit("played", {imgurl, cur, roomid, id: socket.id});
  setPlaying(false);
  cards.forEach(element => {
    if(element.Value===cur.Value&&element.Suit===cur.Suit)
    cards.splice(cards.indexOf(element) , 1);
    setCards([...cards])
    setYourcard(imgurl)
  })
 }
 socket.on("room-full", message => {
  alert(message);
  history.push("/");
 })
 socket.on("play", card => {
  if(card.pos==="top")
  setTopcard(card.value)
  if(card.pos==="left")
  setLeftcard(card.value)
  if(card.pos==="right")
  setRightcard(card.value)
 })
 socket.on("trump", trump =>{
  setTrumpcard("../cards/14_of_"+trump+".png");
 })
 socket.on("playing", ()=> {
   setPlaying(true);
   alert("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
 })
 socket.on("reset", () => {
    setLeftcard("");
    setRightcard("");
    setTopcard("");
    setYourcard("");
    setPlaying(false);
 })
 function createCards(card) {
  const imgurl="../cards/"+card.Value+"_of_"+card.Suit+".png";
  const cur=({Value: card.Value, Suit: card.Suit})
  return(
  <img className="img-fluid imgf" src={imgurl} alt={imgurl} onClick={() => update(cur, imgurl)} />
  );
 }
 //
 return (
  <>
  {!(playing)?<div className='inactive'></div>:<></>}
  <div className="imgc">
   {cards.map(createCards)}
  </div>
  <div className='t'></div>
   <div className='tables'>
    <img className='trump' src={trumpcard}></img>
    <p className='top-name'>{topname}</p>
    <img className='top-card' src={topcard}></img>
    <p className='left-name'>{leftname}</p>
    <img className='left-card' src={leftcard}></img>
    <p className='bottom-name'>YOU</p>
    <img className='bottom-card' src={yourcard}></img>
    <p className='right-name'>{rightname}</p>
    <img className='right-card' src={rightcard}></img>
   </div>
  </>
 );
};

export default Showcards;