import { io } from 'socket.io-client';

const URL = 'https://hackwithit-1.onrender.com';
export const socket = io(URL, {
  autoConnect: false
});
