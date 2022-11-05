module.exports = require('./libs/pnlManager')
const TelegramBot = require('node-telegram-bot-api');
const pnlWatcher = require("binance-leaderboard-listener")
const token = '5403941417:AAHLZTets1DDYojOOKDP_4LGVco29HAcFgs';
const bot = new TelegramBot(token, {polling: false});
const {RestClient} = require('ftx-api');

let alldata = []
let alldata2 = []
let number = 0
let firstSize = 0
let name = "momibi"
console.log("Bot Lancé");

const order = (namecurrency,sens,reduceOnly,sizeof) => {
    const key = 'bwVG4bDvvEvGN1Uslgg8-IFri_9EuOy0oibElJsf';
    const secret = 'xoPfyLb9IbetNtJ5wXrsCEGCbjEa_6ZHNTX2nnl2';

    const restClientOptions = {
        subAccountName: "BBOT",
    };
  
    const client = new RestClient(key, secret, restClientOptions );
  
    try {
        let balanceusdt = 0;
        client.setAccountLeverage(1)
        client.getBalances()
        .then(result => {
          result.result.map(getcoin => {
            if(getcoin.coin === "USDT"){
                balanceusdt += getcoin.total
            } 
            else if(getcoin.coin === "USD") {
                balanceusdt += getcoin.total
            }})

            let size = balanceusdt * 0.10 / sizeof;
            client.getMarket(namecurrency+"-PERP").then(res => {
                if(res.result.minProvideSize > size)
                {
                    res.result.minProvideSize
                }
            })
            if(reduceOnly)
            {
                size = sizeof;
            }

            const NewOrderReq = {
                market: namecurrency+"-PERP",
                side: sens.toLowerCase(),
                price: null,
                type: "market",
                size: size,
                reduceOnly: reduceOnly,
            }
            client.placeOrder(NewOrderReq)
        })
    } catch (e) {
      console.error('Order problem : ', e);
    }
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
    delay: 120000,
    tradeType: "PERPETUAL"
})

listener.on('update', (data) => {

    if(number === 0){
        data.map((newdata) => {alldata.push(newdata); alldata2.push(newdata)})
        number ++
    }
    else{
        alldata2 = [];
        data.map((newdata) => {alldata2.push(newdata)})

        if(alldata2.length > alldata.length)
        {
            console.log("Passage de " + alldata.length + " à " + alldata2.length)
            alldata2.map(element => 
            {
                let test = alldata.some(element2 => element.symbol === element2.symbol)
                if (test  === false)
                {
                    let sens = "SELL"
                    let fleche = "⬇"
                    if(element.amount > 0){
                        sens = "BUY"
                        fleche = "⬆"
                    } 
                    
                    let namecurrency = element.symbol.slice(0,-4)
                    //order(namecurrency,sens,false,element.markPrice);
                    console.log("Order created")
                    console.log("Nouvel Ordre " + element.symbol +" " + element.entryPrice)
                    bot.sendMessage("-1001769991025", "🔱 Author " + name + "\n" + fleche + " OPEN " + sens + " " + element.symbol +"\nPrice " + element.entryPrice.toFixed(4))
                    alldata = alldata2
                }
            })
        }

        else if(alldata2.length < alldata.length)
        {
            console.log("Passage de " + alldata.length + " à " + alldata2.length)
            alldata.map(element => {
                if (alldata2.some(element2 => element.symbol === element2.symbol) === false)
                {
                    let Pourcentage;
                    if(element.amount < 0)
                    {
                        Pourcentage = (element.entryPrice - element.markPrice)/element.entryPrice * 100
                    }
                    else{
                        Pourcentage = (element.markPrice - element.entryPrice)/element.entryPrice * 100
                    }
                    let smyle =""
                    if(Pourcentage > 0)
                    {
                        smyle = "✅"
                    }
                    else
                    {
                        smyle = "❌"
                    }

                    let sens = "BUY"
                    if(element.amount > 0){
                        sens = "SELL"
                    }

                    let namecurrency = element.symbol.slice(0,-4)
                    //order(namecurrency,sens,true,10000000000000);
                    console.log("Order created")
                    console.log("Ordre Cloturé" + element.symbol +" " + element.markPrice)
                    bot.sendMessage("-1001769991025","🔱 Author " + name + "\n" + "🛑 CLOSE " + element.symbol +"\nPrice " + element.markPrice.toFixed(4) + "\n" + smyle + " Percentage : " + Pourcentage.toFixed(2) + "%" + "\n" + smyle + " Percentage of capital : " + (Pourcentage*(element.amount / firstSize)).toFixed(2) + "%" + "\n" + "🔥" + " Avec 5% du capital : " + (5 * (Pourcentage*(element.amount / firstSize)/100)).toFixed(2) + "%" + " 📊" )
                    alldata = alldata2
                }
            })
        }
        else if(alldata2.length === alldata.length)
        {
            for (let i = 0; i < alldata2.length; i++) {
                if(alldata2[i].amount !== alldata[i].amount && alldata2[i].symbol === alldata[i].symbol){
                    let newsize = ((alldata2[i].amount - alldata[i].amount)/alldata[i].amount * 100).toFixed(0)

                        let change = ((alldata2[i].amount - alldata[i].amount)/alldata[i].amount * 100).toFixed(0)
                        let word = "Amount increased for ";
                        if(change < 0){
                            word = "Amount decreased for "
                        }
                        let namecurrency = alldata[i].symbol.slice(0,-4)
                        let sens = "BUY"
                        let reduceOnly = false
                        if(alldata[i].amount > 0 && change > 0){
                            sens = "BUY"
                        }
                        else if (alldata[i].amount > 0 && change < 0)
                        {
                            sens = "SELL"
                            reduceOnly = true
                            change = change - change*2
                        }
                        else if (alldata[i].amount < 0 && change < 0)
                        {
                            sens = "BUY"
                            reduceOnly = true
                            change = change - change*2
                        }
                        else if (alldata[i].amount < 0 && change > 0)
                        {
                            sens = "SELL"
                        }
                        

                        //orderModify(namecurrency,sens,reduceOnly,(change/100) );
                        console.log("Order modified")

                        console.log("Taille modifié sur " + alldata2[i].symbol +" de " + (alldata2[i].amount - alldata[i].amount)/alldata[i].amount * 100 + "% " + " de " + alldata[i].amount + " à " + alldata2[i].amount )
                        alldata = alldata2
                    
                }

                else{
                    alldata[i].markPrice = alldata2[i].markPrice
                }
                
            }
        }

    }
})