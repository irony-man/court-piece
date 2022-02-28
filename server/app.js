const app = require("express")();
const mongoose = require('mongoose');
const http = require("http").createServer(app);
const cors = require("cors");
const { Server } = require("socket.io");
const path = require('path')

app.use(cors());

const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }, 
});

//mongodb://localhost:27017/courtDB
//mongodb+srv://shivam:Shivam0401@blog.jdkd4.mongodb.net/courtDB
mongoose.connect("mongodb+srv://shivam:Shivam0401@blog.jdkd4.mongodb.net/courtDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); 

const roomSchema = new mongoose.Schema({
  roomID: String,
  players: {type :Array},
  started: Boolean,
  completed: Boolean,
  trump: String,
  current: {type: Array},
  score: {type: Array},
  createdAt: {
    type: Date,
    expires: '5m',
    default: Date.now
  }
});
const Room = new mongoose.model("room", roomSchema);

const users = {};

const socketToRoom = {};

io.on('connection', socket => {
  socket.on('create-room', roomid => {
    Room.findOne({roomID: roomid}, (err, room) => {
      if(err) throw err;
      if(room){
        socket.emit("room-full", "This room is full try creating new room or join another...")
      }else{
        socket.join(roomid);
        const n = Math.floor(Math.random() * 4);
        const trump = suits[n];
        Room({
          roomID: roomid,
          trump: trump,
          started: false,
          completed: false,
          score: [3]
        }).save();
      }
    });
  });
  socket.on('join-room', room => {
    const roomid=room.roomid;
    const player=room.player;
    Room.findOne({roomID: roomid}, (err, room) => {
      if (err) throw err;
      if(room){
        socket.join(roomid);
        socket.to(roomid).emit("joined", room.players.length+1);
        Room.updateOne({roomID: roomid},{
        $push: { players: ({name: player, id: socket.id, index: room.players.length, cards: [] }) }
        }, err => {
          if (err) throw err;
        })
      } else {
        socket.emit("room-full", "This room is full try creating new room or join another...")
      }
    });
  });
  socket.on("create-game", room => {
    const roomid=room.roomid;
    const player=room.player;
    socket.join(roomid);
    Room.findOne({roomID: roomid}, (err, room) => {
      if (err) throw err;
      if(room){
        randomcards();
        for (var i = 0; i < 4; i++) {
          const card= makecards(i);
          if(i===3) {
            Room.updateOne({roomID: roomid},{ 
              $push: { players: ({name: player, id: socket.id, index: i, cards: card})}
            }, err => {
              if (err) throw err;
            })
          } else {
            Room.updateOne({roomID: roomid, "players.index": i}, {
            $set: { "players.$.cards": (card) }
            }, err => {
              if (err) throw err;
            })
          }
        }
      }
    })
    io.to(roomid).emit("redirect", roomid);
  })

  //call
  socket.on("join room", roomID => {
    if (users[roomID]) {
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
    socket.emit("all users", usersInThisRoom);
  });
  socket.on("sending signal", payload => {
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
  });
  socket.on('change', (payload) => {
    socket.broadcast.emit('change', payload)
  });


  
  socket.on("roomid", room => {
    Room.findOne({roomID: room}, (err, room)=>{
      if(err) throw err;
      if(room){
        socket.to(room.players[3].id).emit("playing");
        io.to(room.roomID).emit("trump", room.trump)
        for (let i = 0; i < room.players.length; i++) {
          const p = makePlayers(i);
          const left = room.players[p[1]].name;
          const top = room.players[p[2]].name;
          const right= room.players[p[3]].name;
          socket.to(room.players[i].id).emit("show-cards", {top: top, left: left, right: right, cards:room.players[i].cards});
        }
      } else {
        socket.emit("room-full", "This room is full try creating new room or join another...")
      }
    })
  })
  socket.on("played", (play) => {
    Room.updateOne({roomID: play.roomid}, {
      $push: { current: play.cur}
    }, (err) => {
      if (err) throw err;
      Room.findOne({roomID: play.roomid}, (err, room)=>{
        if(err) throw err;
        if(room) {
          const c = room.current.length;
          let k;
          for (var i = 0; i < room.players.length; i++) {
            if(room.players[i].id==play.id)
            k=i;
          }
          const p = makePlayers(k);
          const left = room.players[p[1]].id;
          const top = room.players[p[2]].id;
          const right= room.players[p[3]].id;
          socket.to(top).emit("play", {value: play.imgurl, pos: "top"});
          socket.to(left).emit("play", {value: play.imgurl, pos: "left"});
          socket.to(right).emit("play", {value: play.imgurl, pos: "right"});
          const pl= makePlayers(room.score[room.score.length-1])
          if(c<4) {
            socket.to(room.players[pl[c]].id).emit("playing");
          }
          if(c===4) {
            const w = decideWinner(room.current, room.trump);
            const win = pl[w];
            console.log(win);
            Room.updateOne({roomID: play.roomid}, {
              $push: { score: win}, $set: { current: [] }
            }, err => {
              if (err) throw err;
              setTimeout(() =>{
                io.to(room.roomID).emit("reset");
              }, 5000)
              setTimeout(() =>{
                socket.to(room.players[win].id).emit("playing");
              }, 1000)
            })
          }
        }
      })
    })
  })
})


var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
  var suits = ["spades", "hearts", "diamonds", "clubs"];
  var deck = [];
  const cards = [];

  for (let i = 0; i < suits.length; i++) {
  for (let x = 0; x < values.length; x++) {
    let card = { Value: values[x], Suit: suits[i] };
    deck.push(card);
  }
}

function randomcards() {
  for(let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
}

function makecards(k) {
  k=13*k;
  for (let i = 0; i < 13; i++)
  {
    cards[i] = deck[k];
    k++;
  }
  cards.sort(sorting);
  return cards;
}

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

function makePlayers(i){
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

function decideWinner(curr, trump) {
  const cur = curr[0].Suit;
  var winner=0, t=0, c=0, con=0;
  for (var i = 0; i < 4; i++) {
   if(curr[i].Suit===trump){
    if(parseInt(curr[i].Value)>=parseInt(curr[t].Value)){
     t=i;
     ++con;
    }
   }
   if(curr[i].Suit===cur){
    if(parseInt(curr[i].Value)>=parseInt(curr[c].Value)){
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


/*if(process.env.NODE_ENV === 'production') {
	//set static folder
	app.use(express.static('client/build'))
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
	})
}*/


http.listen(process.env.PORT|| 8080);