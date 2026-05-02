import { useEffect } from "react";
import { Socket } from "socket.io-client";

export let socket: Socket;
export let playerCount: number;

export function setSocket(newSocket: Socket){
    socket = newSocket;
}




