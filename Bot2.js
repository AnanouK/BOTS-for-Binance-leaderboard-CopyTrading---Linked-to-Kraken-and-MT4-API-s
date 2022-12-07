// Copyright Ananou Kevin 2022
// Trading Bot to copie trades from binance learderboard into ftx / kraken account

module.exports = require('./libs/pnlManager')
const axios =  require('axios');
const TelegramBot = require('node-telegram-bot-api');
const pnlWatcher = require("binance-leaderboard-listener")
const token = '5403941417:AAHLZTets1DDYojOOKDP_4LGVco29HAcFgs';
const bot = new TelegramBot(token, {polling: false});
const {RestClient} = require('ftx-api');
const cf = require('./cfRestApiV3')

const baseUrl = 'https://futures.kraken.com'
const apiKey = '5dqU/cGLd3fua+cur+O0vp7DtJtwEl03qmY4N2WCqVHXEctqHd2KAytn'
const apiSecret = 'XZsstx1ioEPohljB8mjF+IHiLAncIKOu0kJu1e4tHe7OJnpfAleV7ABhbMrPR7+qpWTcaSBESXRwMEBhKqP+exs6'
const apiKey2 = 'DrjOTDmu8yoVdb4fFi3Vb3wj9gunGMODZe7WgL2Tyr+waIw25lrFpdXB'
const apiSecret2 = 'p0H8mV9Y5C8myk9ujcfiDHtBGymqdQewCF2vswADb5KBhp+6iGuFor/LXcAUsjif/SpCrCeZCGZFd3qPJ2PPo67t'
const requestTimeoutMs = 5000
const cfRest = new cf.CfRestApiV3(baseUrl, apiKey, apiSecret, requestTimeoutMs)
const cfRest2 = new cf.CfRestApiV3(baseUrl, apiKey2, apiSecret2, requestTimeoutMs)
const liste = [cfRest,cfRest2]

const listener = pnlWatcher.listen({
    encryptedUid: "8D27A8FA0C0A726CF01A7D11E0095577",
    delay: 5000,
    tradeType: "PERPETUAL"
})

const name = "Nothingness"
console.log("Bot Lancé");


var alldata = []
var alldata2 = []
var number = 0
var firstSize = {}
var firstPrice = {}
var MT4Size = {}
var firstTime = {}


var actualSize = 0

const order = async (namecurrency,sens,reduceOnly,sizeof, name, entryPrice, updateTime) => 
{
    for (let i = 0; i < liste.length; i++) 
    {
    try 
    { 
        var balance = 0
        var size = 0
        var nameOfSide = "long"
        let impossible = false

        if(sens === "BUY")
        {
            nameOfSide = "short"
        }

        if(namecurrency === "BTC")
        {
            namecurrency = "xbt"
        }

        await liste[i].getAccounts().then(async result => 
        {
            
            balance = JSON.parse(result.body).accounts.flex.balanceValue

            await liste[i].getOpenPositions().then(result => JSON.parse(result.body)["openPositions"].map(position => 
                {
                    if(!reduceOnly && position.symbol === "pf_"+namecurrency.toLowerCase()+"usd" && position.side  === nameOfSide )
                    {
                        impossible = true
                        console.log("Another trade in the other direction already exist !")
                    }

                    else if (reduceOnly && position.symbol === "pf_"+namecurrency.toLowerCase()+"usd")
                    {
                        size = position.size
                        if(i === 0) 
                        {
                            actualSize = size
                            console.log("Actual Size : " + actualSize)
                        }
                    }
                }))

            if(!impossible)
            {

                if(!reduceOnly)
                {
                    size = balance *  0.20 / sizeof
                }   
                

                console.log("Size of " + i + " : " + size)
                await liste[i].sendOrder("mkt",sens.toLowerCase(), size.toFixed(3),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(async result => {
                    if(size !== 0 && JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status === "invalidSize" )
                    {
                        await liste[i].sendOrder("mkt",sens.toLowerCase(), size.toFixed(2),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(async result => {
                            if(JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status == "invalidSize")
                            {
                                await liste[i].sendOrder("mkt",sens.toLowerCase(), size.toFixed(1),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(async result => {
                                    if(JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status == "invalidSize")
                                    {
                                        await liste[i].sendOrder("mkt",sens.toLowerCase(), size.toFixed(0),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(result => {
                                            if(JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status == "invalidSize")
                                            {
                                                console.log("Can't open this order")
                                            }
                                        }
                                        )
                                    }
                                }
                                )
                            }
                        }
                        )
                    }

                    if(!reduceOnly && size !== 0 && !JSON.parse(result.body).hasOwnProperty("error") && i === 0)
                    {
                        firstSize[name] = size
                        firstPrice[name] = entryPrice
                        firstTime[name] = updateTime
                        console.log("Variables initialised with success ! ")
                    }
                })
            }
        })

    } catch (e) 
    {
      console.error('Order problem : ', e);
    }
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////// MT4 ///////////////////////////////////////////////////////////////////////////////////

    try {

        let MT4name = ""

        if(namecurrency === "DOGE")
        {
            MT4name = "DOG"
        }

        else{
            MT4name = namecurrency
        }

        if(!reduceOnly)
        {
            var balanceMT4 = 0

            await axios.get("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/accountInformation",
            {headers : {
                "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY"

                }
            },
            { 
                "accountId": "36c532e6-1652-458d-818e-0a029d33466d"
            }

            ).then(result => balanceMT4 = result.data.balance);

            let sizeMT4 = 0.05 * (balanceMT4/1000).toFixed(0)

            if(balanceMT4 < 1000)
            {
                sizeMT4 = 0.01
            }

            await axios.post("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/trade",
            { 
                "actionType": "ORDER_TYPE_" + sens,
                "symbol": MT4name+"USD",
                "volume": sizeMT4
            },
            {headers : {
                "Content-Type": "application/json",
                "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY" }
            },
            )
            MT4Size[MT4name+"USD"] = sizeMT4
            console.log(MT4Size[MT4name+"USD"])

        }

        else 
        {
            var positions = []

            await axios.get("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/positions",
            {headers : {
                "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY"

                }
            },
            { 
                "accountId": "36c532e6-1652-458d-818e-0a029d33466d"
            }

            ).then(result => positions = result.data);

            positions.forEach(async element => {
                if(element.symbol === MT4name+"USD" && element.type !== "POSITION_TYPE_"+sens)
                {
                    await axios.post("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/trade",
                    { 
                        "actionType": "POSITIONS_CLOSE_SYMBOL",
                        "symbol": MT4name+"USD"
                    },
                    {headers : {
                        "Content-Type": "application/json",
                        "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY" }
                    },
                    )
                }
            });

            delete MT4Size[MT4name+"USD"]
        }

    } catch (error) {
        console.error('Order problem MT4 : ', error);
    }
}



const orderModify = async (namecurrency,sens,reduceOnly,sizeof) => 
{
    for (let i = 0; i < liste.length; i++) 
    {
    try 
    {
        var sizeOfCurrentPosition = 0

        if(namecurrency === "BTC")
        {
            namecurrency = "xbt"
        }

        await liste[i].getOpenPositions().then(result => JSON.parse(result.body)["openPositions"].map(position => {
            if(position.symbol === "pf_"+namecurrency.toLowerCase()+"usd")
            {
                sizeOfCurrentPosition = position.size
            }
        }))
        console.log("Size " + sizeOfCurrentPosition)
        console.log("Adding or remove " + sizeOfCurrentPosition * sizeof)
        await liste[i].sendOrder("mkt",sens.toLowerCase(), Math.abs(sizeOfCurrentPosition * sizeof).toFixed(3),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(async result => {

            if(sizeOfCurrentPosition !== 0 && JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status === "invalidSize" )
            {
                await liste[i].sendOrder("mkt",sens.toLowerCase(), Math.abs(sizeOfCurrentPosition * sizeof).toFixed(2),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(async result => {

                    if(JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status == "invalidSize")
                    {
                        await liste[i].sendOrder("mkt",sens.toLowerCase(), Math.abs(sizeOfCurrentPosition * sizeof).toFixed(1),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(async result => {

                            if(JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status == "invalidSize")
                            {
                               await liste[i].sendOrder("mkt",sens.toLowerCase(), Math.abs(sizeOfCurrentPosition * sizeof).toFixed(0),"pf_"+namecurrency.toLowerCase()+"usd",reduceOnly).then(result => {

                                    if(JSON.parse(result.body).hasOwnProperty("sendStatus") && JSON.parse(result.body).sendStatus.status == "invalidSize")
                                    {
                                        console.log("Can't open this order")
                                    }
                                }
                                )
                            }
                        }
                        )
                    }
                }
                )
            }
        }
        )

    } catch (e) 
    {
      console.error('OrderModify problem : ', e);
    }
    }

////////////////////////////////////////////////////////////////////////////// MT4 ////////////////////////////////////////////
    try {

        let MT4name = ""

        if(namecurrency === "xbt")
        {
            MT4name = "BTC"
        }
        else if(namecurrency === "DOGE")
        {
            MT4name = "DOG"
        }
        else{
            MT4name = namecurrency
        }

        if(!reduceOnly && MT4Size.hasOwnProperty(MT4name+"USD"))
        {
            let sizeModified = MT4Size[MT4name+"USD"] * sizeof

            await axios.post("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/trade",
            { 
                "actionType": "ORDER_TYPE_" + sens,
                "symbol": MT4name+"USD",
                "volume": sizeModified
            },
            {headers : {
                "Content-Type": "application/json",
                "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY" }
            },
            )

            MT4Size[MT4name+"USD"] += sizeModified
        }

    } catch (error) {
        console.error('Order problem MT4 : ', error);
    }
}



listener.on('update', (data) => 
{
    try
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
                            
                        order(namecurrency,sens,false,newList.markPrice, newList.symbol, newList.entryPrice, newList.updateTime);

                        console.log("New order " + newList.symbol +" " + newList.entryPrice + " "  +(new Date()).toGMTString())
                        bot.sendMessage("-1001769991025", "🔱 Author " + name + "\n" + fleche + " OPEN " + sens + " " + newList.symbol +"\nPrice " + newList.entryPrice.toFixed(4))

                    }
                })
                alldata = alldata2
            }

            else if(alldata2.length < alldata.length)
            {
                console.log(alldata.length + " trade(s) to " + alldata2.length)
                alldata.map(async oldList => 
                {
                    if (alldata2.some(newList => oldList.symbol === newList.symbol) === false)
                    {
                        let Pourcentage;

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
                            wins += 1
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
                        await order(namecurrency,sens,true,oldList.markPrice, oldList.symbol, oldList.entryPrice, oldList.updateTime);
                        trades += 1


                        console.log("Order Closed" + oldList.symbol +" " + oldList.markPrice + " " +(new Date()).toGMTString())

                        if(firstSize.hasOwnProperty(oldList.symbol))
                        {
                            bot.sendMessage("-1001769991025","🔱 Author " + name + "\n" + "🛑 CLOSE " + oldList.symbol +"\nPrice " + oldList.markPrice.toFixed(4) + "\n" + smyle + " Percentage : " + (Pourcentage*(actualSize / firstSize[oldList.symbol])).toFixed(2) + "%" + "\n" + "📊" + " With 20% of capital : " + (20 * (Pourcentage*(actualSize / firstSize[oldList.symbol])/100)).toFixed(2) + "%")
                            delete firstSize[oldList.symbol]
                            delete firstPrice[oldList.symbol]
                            delete firstTime[oldList.symbol]
                        }
                        else
                        {
                            bot.sendMessage("-1001769991025","🔱 Author " + name + "\n" + "🛑 CLOSE " + oldList.symbol +"\nPrice " + oldList.markPrice.toFixed(4) + "\n" + smyle + " Percentage : " + Pourcentage.toFixed(2) + "%" + "\n" + "📊" + " With 20% of capital : " + (20 * Pourcentage / 100).toFixed(2) + "%" )
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
                        let check = true
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
                            check = false
                            sens = "SELL"
                            reduceOnly = true
                            change = change - change*2
                        }
                        else if (alldata[i].amount < 0 && change < 0)
                        {
                            check = false
                            sens = "BUY"
                            reduceOnly = true
                            change = change - change*2
                        }
                        else if (alldata[i].amount < 0 && change > 0)
                        {
                            sens = "SELL"
                        }

                        if(firstTime.hasOwnProperty(alldata2[i].symbol) &&  (   (parseInt(firstTime[alldata2[i].symbol][3]) === parseInt(alldata2[i].updateTime[3]) && parseInt(firstTime[alldata2[i].symbol][4]) < parseInt(alldata2[i].updateTime[4])) || (parseInt(firstTime[alldata2[i].symbol][3]) !== parseInt(alldata2[i].updateTime[3]))) && check && change >= 10 ) //check if the trade with opened by this trader
                        {
                            console.log("Modification sent")
                            orderModify(namecurrency,sens,reduceOnly,(change/100));
                        }

                        else{
                            console.log("Modification skiped")
                        }
                        
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
    } catch (error) {
        console.error('Order problem : ', error);
    }
})