import { WebsocketAPI } from '@binance/connector';
import { ref, onValue, set, update, remove} from "firebase/database";
import database from './firebaseDatabase.js';
// callbacks for different events
const callbacks = {
  open: (client) => {
    client.tickerBook({symbols: ['BTCUSDT', 'ETHUSDT', 'USDCUSDT']});
    // Orderbook FLOW!!!!
    // client.orderbook('BNBUSDT', { limit: 10 })
  },
  close: () => console.log('Disconnected with Websocket server'),
  message: data => {
    const result = JSON.parse(data);
    result.result.forEach(element => {
        const symbolRegex = /(.*)(USDT)/gm;
        const matchArray = [...element.symbol.matchAll(symbolRegex)];
        console.log(element.bidPrice, element.askPrice);
        update(ref(database, `exchangeConfig/${matchArray[0][2]}/${matchArray[0][1]}`), {
            buy: parseFloat(1 / element.bidPrice),
            sell: parseFloat(1 / element.askPrice)
        });
    });
    // For orderbook flow!!!!!!
    // let bidsValue = 0;
    // let asksValue = 0;
    // result.result.bids.forEach(element => {
    //     bidsValue += Number(element[0])
    // });
    // result.result.asks.forEach(element => {
    //     asksValue += Number(element[0])
    // });
    // console.log('bidsValue', bidsValue / 10, 'asksValue===', asksValue / 10);
 }
}

const BinanceAPI = new WebsocketAPI(null, null, { callbacks });


export default BinanceAPI;
