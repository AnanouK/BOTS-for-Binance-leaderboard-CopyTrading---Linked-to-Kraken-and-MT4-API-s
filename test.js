module.exports = require('./libs/pnlManager')
const TelegramBot = require('node-telegram-bot-api');
const pnlWatcher = require("binance-leaderboard-listener")
const token = '5403941417:AAHLZTets1DDYojOOKDP_4LGVco29HAcFgs';
const bot = new TelegramBot(token, {polling: false});
const {RestClient} = require('ftx-api');

let alldata = []
let alldata2 = []
let number = 0
let name = "momibi"

const order = () => {
    const key = 'bwVG4bDvvEvGN1Uslgg8-IFri_9EuOy0oibElJsf';
    const secret = 'xoPfyLb9IbetNtJ5wXrsCEGCbjEa_6ZHNTX2nnl2';

    const restClientOptions = {
        subAccountName: "BBOT",
    };
  
    const client = new RestClient(key, secret, restClientOptions );
    client.getPositions()
        .then(result => {
            result.result.map(name => {
                if(name.future === 'BTC-PERP'){
                    console.log(name.openSize)
                }
            })
          })

}

const orderModify = (namecurrency,sens,reduceOnly,sizeof) => {(async () => {
    const key = 'bwVG4bDvvEvGN1Uslgg8-IFri_9EuOy0oibElJsf';
    const secret = 'xoPfyLb9IbetNtJ5wXrsCEGCbjEa_6ZHNTX2nnl2';

    const restClientOptions = {
        subAccountName: "BBOT",
    };
  
    const client = new RestClient(key, secret, restClientOptions );
  
    try {
        let ordersize = 0;
        const FillsReq = {
            market: namecurrency+"-PERP",
            limit: 1
        }
        client.setAccountLeverage(1).catch((error) => {console.error("erreur dans le set " + error);});
        client.getFills(FillsReq).then(res => {
            ordersize = res.result[0].size; 
            console.log("taille trouvée " + ordersize);
            console.log("pourcentage " + sizeof);
            console.log("taille final " + ordersize * sizeof);
        
            const NewOrderReq = {
                market: namecurrency+"-PERP",
                side: sens.toLowerCase(),
                price: null,
                type: "market",
                size: ordersize * sizeof,
                reduceOnly: reduceOnly,
            }
            client.placeOrder(NewOrderReq).catch((error) => {"erreur dans le place order" + console.error(error);});
        
        
        }).catch((error) => {console.error("erreur dans le getfills " + error);});
        console.log("Ancienne size " + ordersize)

    } catch (e) {
      console.error('Order problem : ', e);
    }

  })();
}

const listener = pnlWatcher.listen({
    encryptedUid: "F45BBD3F4C148BFCE413B0A343A1BF97",
    delay: 60000,
    tradeType: "PERPETUAL"
})

listener.on('update', (data) => {

    order();
    
})


module.exports = {
    order,
    orderModify
}