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

app.get('/currencyList', function(clientRequest, clientResponse) {
    const currencyList = ref(database, 'currency/');
    onValue(currencyList, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
        }, {
            onlyOnce: true
        });
})

app.post('/currencyValue', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    console.log(body);
    update(ref(database, `currency/${body.currenyName}`), {
        value: body.value
    });
    const currencyData = ref(database, `currency/${body.currenyName}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
    
})

app.get('/usersList', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query
})

app.get('/order', function(clientRequest, clientResponse) {
    const currencyList = ref(database, 'order/');
    onValue(currencyList, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    });
})

app.put('/order', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    console.log(body);
    set(ref(database, `order/${body.transactionID}`), {
        transactionID: body.transactionID,
        currency: body.currency,
        fromSum: body.fromSum,
        toSum: body.toSum,
        coupon: body.coupon,
        wallet: body.wallet,
        cardName: body.cardName,
        login: body.login,
        timestamp: body.timestamp,
        status: body.status
    });
    const currencyData = ref(database, `order/${body.transactionID}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.post('/order', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    console.log(body);
    update(ref(database, `order/${body.transactionID}`), {
        status: body.status
    });
    const currencyData = ref(database, `order/${body.transactionID}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.get('/', function(clientRequest, clientResponse) {

})



app.get('/currencyValue', function (clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    clientResponse.send({first:'1', seccond: '2'});
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
