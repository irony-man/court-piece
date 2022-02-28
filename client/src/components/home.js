import React, { useEffect, useState } from 'react';
import "./home.css";
import socket from '../socket';
import id from '../roomid';
import { useHistory } from 'react-router-dom';

const Home = () => {
  const [home, setHome] = useState(true);
  const [creator, setCreator] = useState(false);
  const [roomid, setRoomid] = useState(id)
  const [players, setPlayers] = useState(0);
  const [started, setStarted] = useState(false);

  const history= useHistory();
  function gameCreated(e){
    e.preventDefault();
    setStarted(true)
    socket.emit("create-game", {roomid: roomid, player: e.target.username.value});
  }
  function createGame(e){
    e.preventDefault();
    setHome(false);
    setCreator(true);
    socket.emit('create-room', roomid);
    socket.on("creator", value => {
      setCreator(value);
    })
  }
  function joinGame(e){
    e.preventDefault();
    setHome(false);
    setRoomid(e.target.join.value);
    socket.emit('join-room', {roomid: e.target.join.value, player: e.target.username.value})
    socket.on("room-full", message => {
      alert(message);
      window.location.reload();
    })
  }
  window.addEventListener('beforeunload', function (e) {
    e.returnValue = ''
  });
  socket.on("joined", player=>{
    setPlayers(player);
  })
  socket.on("redirect", value => {
    setTimeout(() => {
      history.push("/play/?room="+value);
    }, 3000);
  })
 return (
   <>
   {home?
  <>
    <h1 className='name'>Court Piece</h1>
    <form onSubmit={(e)=>joinGame(e)}>
      <input type="text" name="username" placeholder='Name' required />
      <input type="text" name="join" placeholder='Game Code' required />
     <input className='subjoin' type="submit" value="JOIN GAME" />
    </form>
    <h2>OR</h2>
    <form onSubmit={(e)=>createGame(e)}>
     <input className='subcreate' type="submit" value="Create Game" />
    </form>
  </>:<>
     <h1 className='room-id'>Room ID: <span>{roomid}</span></h1>
     <p style={{color: "white", textDecoration: "underline"}}>Do not refresh this page or back..</p>
     {players<3?<div className='mb-5'><button className='btn btn-light' onClick={() => navigator.clipboard.writeText(roomid)}><i className="far fa-copy"></i></button>
     <a className='btn btn-success share' href={`whatsapp://send?text=${roomid}`} target={"blank"}><i className="fab fa-whatsapp"></i></a></div>:<></>}
     
     {creator?<><h3>{players} players have joined this room.. You can start the game when 3 players join...</h3>
     <form onSubmit={(e)=>gameCreated(e)}>
      <input className='mt-3' type="text" name="username" placeholder='Name' required />
      <br/>
      {players===3&&!started?<input className='subcreate' type="submit" value="Start Game" />:<input type="button" value="Start Game" />}
     </form></>:<><h2>Creator will start the game...</h2></>}
  </>}</>
  );
};

export default Home;