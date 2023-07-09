import express, { json, urlencoded } from 'express';
import cors from 'cors';
import request from "request";
import axios from 'axios';
import http from 'http'
import https from 'https'
import multer from 'multer'
import * as path from 'path';
import { Server } from 'socket.io';
import { ref, onValue, set, update, remove} from "firebase/database";
import database from './firebaseDatabase.js';
import { telegaToken, SERVER_NAME} from './constants.js'
import BinanceAPI from './binanceAPI.js';

const urlTelegaMessage = "https://api.telegram.org/bot";


const TWO_MINUTES_IN_MILISECONDS = 120000
const app = express();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const body = req.body;
        const uniqueSuffix = body.transactionID
        cb(null, uniqueSuffix + ".jpeg")
    }
})
const uploads = multer({storage: storage});

app.use(cors());
app.use(uploads.any());
app.use(json());
app.use(urlencoded());
app.set('trust proxy', true);

setInterval(() => {
    BinanceAPI.tickerBook({symbols: ['BTCUSDT', 'ETHUSDT', 'USDCUSDT']})
}, TWO_MINUTES_IN_MILISECONDS); 

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
        firstName: body.first_name || "",
        lastName: body.last_name || "",
        userName: body.username || "",
        type: 'user',
        id: body.id
    }
    set(ref(database, `users/${body.id}`), userData);
    clientResponse.send(JSON.stringify(userData));
})

app.post('/user', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    const userRef = ref(database, `users`);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        for (const key in data) {
            if(data[key].userName === body.userName) {
                update(ref(database, `users/${data[key].id}`), {type: 'admin'});
                clientResponse.send(JSON.stringify(data[key]));
            }
        }
    }, {
        onlyOnce: true
    })
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

app.post('/currencySell', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    const currencyPairs = body.currenyName.split('-');
    update(ref(database, `exchangeConfig/${currencyPairs[0]}/${currencyPairs[1]}`), {
        sell: body.value
    });
    const currencyData = ref(database, `exchangeConfig/${currencyPairs[0]}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.post('/currencyBuy', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    const currencyPairs = body.currenyName.split('-');
    update(ref(database, `exchangeConfig/${currencyPairs[0]}/${currencyPairs[1]}`), {
        buy: body.value
    });
    const currencyData = ref(database, `exchangeConfig/${currencyPairs[0]}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.post('/currencyMultiplierSell', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    const currencyPairs = body.currenyName.split('-');
    update(ref(database, `exchangeConfig/${currencyPairs[0]}/${currencyPairs[1]}`), {
        sellMultiplier: body.value
    });
    const currencyData = ref(database, `exchangeConfig/${currencyPairs[0]}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.post('/currencyMultiplierBuy', function (clientRequest, clientResponse) {
    const body = clientRequest.body;
    const currencyPairs = body.currenyName.split('-');
    update(ref(database, `exchangeConfig/${currencyPairs[0]}/${currencyPairs[1]}`), {
        buyMultiplier: body.value
    });
    const currencyData = ref(database, `exchangeConfig/${currencyPairs[0]}`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.get(/.png$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'src/assets/images/' + clientRequest.path));
})

app.get(/.svg$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'src/assets/images/' + clientRequest.path));
})

app.get(/.jpeg/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, 'uploads/' + clientRequest.path));
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
    const currencyList = ref(database, 'users/');
    onValue(currencyList, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    });
})

app.get('/exchangeConfig', function(clientRequest, clientResponse) {
    const currencyList = ref(database, `exchangeConfig`);
    onValue(currencyList, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    });
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
    let body = {...clientRequest.body};
    body = JSON.parse(body.orderData)
    body.imgPath = `${SERVER_NAME}/${body.transactionID.toString()}.jpeg`;
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
        adminsList.forEach(element => {
            const messageText = `Нова транзакція:
Сума ${body.fromSum.value} ${body.fromSum.currency}
Час ${new Date(body.timestamp).toString()}
Рахунок отримувача:${body.wallet} 
`
            const messageUrl = `${urlTelegaMessage}${telegaToken}/sendMessage?chat_id=${element.id}&text=${encodeURI(messageText)}`
            axios.get(messageUrl);
        });
        clientResponse.send('message sended');
    }, {
        onlyOnce: true
    })

})

app.post('/orders', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    update(ref(database, `orders/${body.transactionID}`), {
        status: body.status
    });
    clientResponse.send(JSON.stringify('OK'));
})

app.get('/', function(clientRequest, clientResponse) {

})

app.get('/appConfig', function(clientRequest, clientResponse) {
    const currencyData = ref(database, `appConfig`);
    onValue(currencyData, (snapshot) => {
        const data = snapshot.val();
        clientResponse.send(JSON.stringify(data));
    }, {
        onlyOnce: true
    })
})

app.post('/appConfig', function(clientRequest, clientResponse) {
    const body = clientRequest.body;
    const updatedAppConfig = {
        cardNumber: body.cardNumber,
        conactManager: body.conactManager,
        cryptoWallet: body.cryptoWallet,
        EURCard: body.EURCard,
        UAHCard: body.UAHCard,
        USDCard: body.USDCard,
    }
    update(ref(database, `appConfig`), updatedAppConfig);
    clientResponse.send(JSON.stringify(updatedAppConfig));
})

app.get('/test', function(clientRequest, clientResponse) {
    clientResponse.end("Hello world");
});

const server = https.createServer(app);

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
