import React, { useState, useRef, useEffect } from 'react';
import "./chatbox.css";
import Peer from 'simple-peer';
import socket from '../socket';
const Video = (props) => {
const ref = useRef();

useEffect(() => {
  props.peer.on("stream", (stream) => {
    ref.current.srcObject = stream;
  });
}, []);

return <video playsInline autoPlay ref={ref} />;
};

 const Chat = () => {
  const [peers, setPeers] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = new URLSearchParams(window.location.search).get("room");
  
  useEffect(() => {
    createStream();
  }, []);

  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socket.emit("join room", roomID);
        socket.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socket.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push({
              peerID: userID,
              peer,
            });
          });
          setPeers(peers);
        });
        socket.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          const peerObj = {
            peer,
            peerID: payload.callerID,
          };
          setPeers((users) => [...users, peerObj]);
        });

        socket.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });

        socket.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socket.on("change", (payload) => {
          setUserUpdate(payload);
        });
      });
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("returning signal", { signal, callerID });
    });
    peer.signal(incomingSignal);
    return peer;
  }
  function mute() {
    if (userVideo.current.srcObject) {
      userVideo.current.srcObject.getTracks().forEach(function (track) {
        if (track.kind === "audio") {
          if (track.enabled) {
            socket.emit("change",[...userUpdate, {
              id: socket.id,
              audioFlag: false,
            }]);
            track.enabled = false;
            setAudioFlag(false);
          } else {
            socket.emit("change",[...userUpdate, {
              id: socket.id,
              audioFlag: true,
            }]);
            track.enabled = true;
            setAudioFlag(true);
          }
        }
      });
    }
  }

  return (
    <>
      <video muted ref={userVideo} autoPlay playsInline />
      <button className='mute' onClick={() => {mute()}}>
        {audioFlag ? <i class="fas fa-microphone"></i> : <i class="fas fa-microphone-slash"></i>}
      </button>
      {peers.map((peer, index) => {
        return (
          <div key={peer.peerID} >
            <Video peer={peer.peer} />
          </div>
        );
      })}
    </>
  );
};

export default Chat;