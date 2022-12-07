// Copyright Ananou Kevin 2022
// Trading Bot to copie trades from binance learderboard into ftx / kraken account

module.exports = require('./libs/pnlManager')
const TelegramBot = require('node-telegram-bot-api');
const pnlWatcher = require("binance-leaderboard-listener")
const token = '5403941417:AAHLZTets1DDYojOOKDP_4LGVco29HAcFgs';
const bot = new TelegramBot(token, {polling: false});
const {RestClient} = require('ftx-api');
const cf = require('./cfRestApiV3')

const baseUrl = 'https://futures.kraken.com'
const apiKey = '5dqU/cGLd3fua+cur+O0vp7DtJtwEl03qmY4N2WCqVHXEctqHd2KAytn'
const apiSecret = 'XZsstx1ioEPohljB8mjF+IHiLAncIKOu0kJu1e4tHe7OJnpfAleV7ABhbMrPR7+qpWTcaSBESXRwMEBhKqP+exs6'
const requestTimeoutMs = 5000
const cfRest = new cf.CfRestApiV3(baseUrl, apiKey, apiSecret, requestTimeoutMs)

var alldata = []
var alldata2 = []
var number = 0
var firstSize = {}
var firstPrice = {}

const name = "Anonymous User-420a31"
console.log("Bot Lancé");


const order = (namecurrency,sens,reduceOnly,sizeof) => 
{
    try 
    { 
        
        var balance = 0
        var size = 0

        cfRest.getAccounts().then(async result => 
            {
            
            balance = JSON.parse(result.body).accounts.flex.balanceValue

            if(reduceOnly)
            {
                    await cfRest.getOpenPositions().then(result => JSON.parse(result.body)["openPositions"].map(position => {
                    if(position.symbol === "pf_"+namecurrency+"usd")
                    {
                        size = position.size
                    }
                    }))
            }
            else
            {
                size = balance * 0.50 / sizeof
            }   
            
            cfRest.sendOrder("mkt",sens.toLowerCase(),size.toFixed(3),"pf_"+namecurrency+"usd",reduceOnly).then(result => console.log(JSON.parse(result.body)))
        })

    } catch (e) 
    {
      console.error('Order problem : ', e);
    }
}



const orderModify = async (namecurrency,sens,reduceOnly,sizeof) => 
{
    try 
    {
        var sizeOfCurrentPosition = 0
        await cfRest.getOpenPositions().then(result => JSON.parse(result.body)["openPositions"].map(position => {
            if(position.symbol === "pf_"+namecurrency+"usd")
            {
                sizeOfCurrentPosition = position.size
            }
        }))

        console.log("Adding " + sizeOfCurrentPosition * sizeof)
        cfRest.sendOrder("mkt",sens.toLowerCase(), Math.abs(sizeOfCurrentPosition * sizeof).toFixed(3),"pf_"+namecurrency+"usd",reduceOnly).then(result => console.log(JSON.parse(result.body)))

    } catch (e) 
    {
      console.error('OrderModify problem : ', e);
    }
}

const listener = pnlWatcher.listen({
    encryptedUid: "FAEE208524D779963BC8C2943797D906",
    delay: 5000,
    tradeType: "PERPETUAL"
})

listener.on('update', (data) => 
{
    if(number === 0 && data != null)
    {
        data.map((newdata) => {alldata.push(newdata); alldata2.push(newdata)})
        number ++
    }

    else
    {
        alldata2 = [];
        if(data != null)
        {
            data.map((newdata) => {alldata2.push(newdata)}) 
        }

        if(alldata2.length > alldata.length) //if there is a new trade
        {
            console.log(alldata.length + " trade(s) to " + alldata2.length)
            alldata2.map(newList => 
            {
                if(alldata.some(oldList => newList.symbol === oldList.symbol) === false)
                {
                    let sens = "SELL"
                    let fleche = "⬇"
                    let namecurrency = newList.symbol.slice(0,-4)

                    if(newList.amount > 0) //BUY trade
                    {
                        sens = "BUY"
                        fleche = "⬆"
                    } 
                          
                    order(namecurrency,sens,false,newList.markPrice);

                    console.log("New order " + newList.symbol +" " + newList.entryPrice + " " +(new Date()).toGMTString())
                    bot.sendMessage("-1001769991025", "🔱 Author " + name + "\n" + fleche + " OPEN " + sens + " " + newList.symbol +"\nPrice " + newList.entryPrice.toFixed(4))

                    firstSize[newList.symbol] = newList.amount
                    firstPrice[newList.symbol] = newList.entryPrice
                }
            })
            alldata = alldata2
        }

        else if(alldata2.length < alldata.length)
        {
            console.log(alldata.length + " trade(s) to " + alldata2.length)
            alldata.map(oldList => 
            {
                if (alldata2.some(newList => oldList.symbol === newList.symbol) === false)
                {
                    let Pourcentage;
                    let PourcentageFirst;

                    if(oldList.amount < 0)
                    {
                        Pourcentage = (oldList.entryPrice - oldList.markPrice)/oldList.entryPrice * 100

                        if(firstPrice.hasOwnProperty(oldList.symbol) === true)
                        {
                            PourcentageFirst = (firstPrice[oldList.symbol] - oldList.markPrice)/oldList.entryPrice * 100
                        }
                    }
                    else{
                        
                        Pourcentage = (oldList.markPrice - oldList.entryPrice)/oldList.entryPrice * 100

                        if(firstPrice.hasOwnProperty(oldList.symbol) === true)
                        {
                            PourcentageFirst = (oldList.markPrice - firstPrice[oldList.symbol])/oldList.entryPrice * 100
                        }
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
                    if(oldList.amount > 0){
                        sens = "SELL"
                    }

                    let namecurrency = oldList.symbol.slice(0,-4)
                    order(namecurrency,sens,true,10000000000000);

                    console.log("Order Closed" + oldList.symbol +" " + oldList.markPrice + " " +(new Date()).toGMTString())

                    if(firstSize.hasOwnProperty(oldList.symbol) === true && firstPrice.hasOwnProperty(oldList.symbol) === true)
                    {
                        bot.sendMessage("-1001769991025","🔱 Author " + name + "\n" + "🛑 CLOSE " + oldList.symbol +"\nPrice " + oldList.markPrice.toFixed(4) + "\n" + smyle + " Percentage : " + PourcentageFirst.toFixed(2) + "%" + "\n" + smyle + " Percentage with modifications : " + (Pourcentage*(oldList.amount / firstSize[oldList.symbol])).toFixed(2) + "%" + "\n" + "📊" + " With 5% of capital : " + (5 * (Pourcentage*(oldList.amount / firstSize[oldList.symbol])/100)).toFixed(2) + "%")
                        delete firstSize[oldList.symbol]
                        delete firstPrice[oldList.symbol]
                    }
                    else
                    {
                        bot.sendMessage("-1001769991025","🔱 Author " + name + "\n" + "🛑 CLOSE " + oldList.symbol +"\nPrice " + oldList.markPrice.toFixed(4) + "\n" + smyle + " Percentage : " + Pourcentage.toFixed(2) + "%" )
                    }
                }
            })
            
            alldata = alldata2
        }

        else if(alldata2.length === alldata.length)
        {
            for (let i = 0; i < alldata2.length; i++) 
            {
                if(alldata2[i].amount !== alldata[i].amount && alldata2[i].symbol === alldata[i].symbol)
                {
                    let namecurrency = alldata[i].symbol.slice(0,-4)
                    let sens = "BUY"
                    let reduceOnly = false
                    let change = ((alldata2[i].amount - alldata[i].amount)/alldata[i].amount * 100).toFixed(0)

                    if(alldata[i].amount > 0 && change > 0)
                    {
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
                        
                    orderModify(namecurrency,sens,reduceOnly,(change/100));
                    
                    console.log("Size modified for " + alldata2[i].symbol +" by " + (alldata2[i].amount - alldata[i].amount)/alldata[i].amount * 100 + "% " + alldata[i].amount + " to " + alldata2[i].amount + "\nLast entryPrice " + alldata[i].entryPrice + " New entryPrice " + alldata2[i].entryPrice + " " +(new Date()).toGMTString())

                    alldata = alldata2
                }

                else
                {
                    alldata[i].markPrice = alldata2[i].markPrice
                }
            }
        }
    }
})