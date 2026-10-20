import { WebSocket, WebSocketServer } from "ws";
import { parse, v4 as uuidv4 } from "uuid";

const PORT = Number(process.env.PORT) || 8080;

const wss = new WebSocketServer({
  port: PORT,
  host: "0.0.0.0",
});

interface User {
  socket: WebSocket;
  username: string;
  room: string;
}

let userCount = 0;
let allSocket: User[] = [];

wss.on("listening", () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});


wss.on("connection", (socket) => {
  console.log("User Connected!");
  userCount = userCount + 1;

  socket.on("message", (message) => {
    //@ts-ignore
    const  parsedMessage = JSON.parse(message.toString());
    const username = parsedMessage.payload.username;

    if( parsedMessage.type == 'join'){
      allSocket.push({
         socket,
         username,
         room:parsedMessage.payload.roomId
      })
      socket.send("Join Successfully!");
   };

      if(parsedMessage.type=='chat'){
         const CurrentUserRoom  = allSocket.find((x)=> x.socket == socket)?.room;
         const data ={
            type:"chat",
            payload:{
            message:parsedMessage.payload.message,
            username:username
         }}
         allSocket.map((x)=>{
         if(x.room == CurrentUserRoom){
            
            x.socket.send(JSON.stringify(data));
         }
         })
         socket.send("Message Sent Successfully!")
      };

      if(parsedMessage.type == 'create'){
           const roomId = uuidv4();
           allSocket.push({
            socket,
            username,
            room:roomId
         })
           const data = {
            type:"Room Created!",
            payload:{
            roomId:roomId,
            username:username
         }
           }

           socket.send(JSON.stringify(data));
           socket.send("You Create & Join Room Successfully!")
      }

});

socket.on('close',()=>{
 allSocket =allSocket.filter(x => x.socket != socket)
})

})
