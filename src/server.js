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
    const currencyData = ref(database, `users/${body.id}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    });
});

app.put('/user', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    const userData = {
        firstName: body.first_name,
        lastName: body.last_name,
        userName: body.username,
        type: 'user',
        id: body.id
    }
    set(ref(database, `users/${body.id}`), userData);
    clientResponse.send(JSON.stringify(userData));

})

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

app.post('/currencyReserves', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, `currency/${body.currenyName}`), {
        reserve: body.value
    });
    const currencyData = ref(database, `currency/${body.currenyName}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.post('/minExchange', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, `currency/${body.currenyName}`), {
        minExchange: body.value
    });
    const currencyData = ref(database, `currency/${body.currenyName}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.get('/usersList', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query
})

app.get('/orders', function(clientRequest, clientResponse) {
    const targetQuery = clientRequest.query;
    if (targetQuery.id) {
        const currencyList = ref(database, `orders/${targetQuery.id}`);
        onValue(currencyList, (snapshot) => {
            const data = snapshot.val();
            clientResponse.send(JSON.stringify(data));
        }, {
            onlyOnce: true
        });
    } else {
        const currencyList = ref(database, 'orders/');
        onValue(currencyList, (snapshot) => {
            const data = snapshot.val();
            clientResponse.send(JSON.stringify(data));
        }, {
            onlyOnce: true
        });
    }
})

app.put('/orders', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    set(ref(database, `orders/${body.transactionID}`), body);
    const currencyData = ref(database, `users`);
    const adminsList = [];
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        for (const key in data) {
            if (data[key].type === 'admin') {
                adminsList.push(data[key]);
            }
        }
        const admin = adminsList.pop();
        const messageText = `Нова транзакція:
Сума ${body.fromSum} ${body.currency.split('/')[0]}
Час ${new Date(body.timestamp).toString()}`
        const messageUrl = `${urlTelegaMessage}${telegaToken}/sendMessage?chat_id=${admin.id}&text=${encodeURI(messageText)}`
        axios.get(messageUrl).catch(error => {
            console.log(error);
        })
        clientResponse.send('message sended');
    }, {
        onlyOnce: true
    })

})

app.post('/orders', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    console.log(body);
    update(ref(database, `orders/${body.transactionID}`), {
        status: body.status
    });
    clientResponse.send(JSON.stringify('OK'));
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
