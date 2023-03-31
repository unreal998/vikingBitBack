import express, { json, urlencoded } from 'express';
import cors from 'cors';
import request from "request";
import { load } from 'cheerio';
import { writeFileSync, readFileSync } from 'fs';
import fsExtra from 'fs-extra';
import axios from 'axios';
import http from 'http'
import * as path from 'path';
import { Server } from 'socket.io';
import { ref, onValue, set, update, remove} from "firebase/database";
import database from './firebaseDatabase.js';
import { telegaToken, SERVER_NAME} from './constants.js'

const urlTelegaMessage = "https://api.telegram.org/bot";

const app = express();

app.use(cors());

app.use(json());
app.use(urlencoded());
app.set('trust proxy', true);
const __dirname = path.resolve();

app.post('/auth', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
});

app.get('/adminsList', function(clientRequest, clientResponse) {

})

app.get('/usersList', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query
})

app.get('/order', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
})

app.get('/', function(clientRequest, clientResponse) {

})


app.get('/test', function(clientRequest, clientResponse) {
    clientResponse.end("Hello world");
});

const server = http.createServer(app);

const users = {}

const io = new Server(server, {
  cors: {
    origin: SERVER_NAME
  }
});

io.on('connection', socket => {
    socket.on('new-user', data => {
        users[socket.id] = data.chatId;
    })
    socket.on('send-chat-message', message => {
    })
    socket.on('send-telega-message', message => {
    });
    socket.on('disconnect', () => {
        delete users[socket.id]
    });
  }
)

export default server;
