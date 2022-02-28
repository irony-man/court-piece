import { io } from "socket.io-client";
//"https://court-piece-by-shivam.herokuapp.com/"
const socket= io("http://localhost:8080");
export default socket;