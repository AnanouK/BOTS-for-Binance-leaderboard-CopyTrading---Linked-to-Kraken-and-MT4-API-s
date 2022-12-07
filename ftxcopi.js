const order = (namecurrency,sens,reduceOnly,sizeof) => 
{
    const key = 'bwVG4bDvvEvGN1Uslgg8-IFri_9EuOy0oibElJsf';
    const secret = 'xoPfyLb9IbetNtJ5wXrsCEGCbjEa_6ZHNTX2nnl2';

    const restClientOptions = 
    {
        subAccountName: "BBOT",
    };
  
    const client = new RestClient(key, secret, restClientOptions);
  
    try 
    {
        client.getPositions().then(result => 
            {
                result.result.map(name => 
                    {(async () => 
                        {
                            if(name.future === namecurrency+"-PERP" && name.openSize === 0 && reduceOnly)
                            {
                                console.log("Unable to close this trade because the open order doesn't exist. " +(new Date()).toGMTString())
                            }
                            
                            else if(name.future === namecurrency+"-PERP")
                            {
                                var balanceusdt = 0;
                                client.setAccountLeverage(2).catch((error) => {"Error in the leverage" + console.error(error)})
                                await client.getBalances().then(result => 
                                {
                                    result.result.map(getcoin => 
                                    {
                                        if(getcoin.coin === "USDT" || getcoin.coin === "USD")
                                        {
                                            balanceusdt += getcoin.total
                                            console.log(balanceusdt)
                                        } 
                                    })
                                })

                                var size = balanceusdt * 0.05 / sizeof; //5% of all capital in each trade
                                console.log(balanceusdt)
                                
                                if(reduceOnly)
                                {
                                    size = sizeof;
                                }

                                const NewOrderReq = 
                                {
                                    market: namecurrency+"-PERP",
                                    side: sens.toLowerCase(),
                                    price: null,
                                    type: "market",
                                    size: size,
                                    reduceOnly: reduceOnly,
                                }
                                console.log("Size of the trade : " + size);
                                //client.placeOrder(NewOrderReq).catch((error) => {"Error in the place order" + console.error(error);});
                            }
                        }
                    )})
            })
    } catch (e) 
    {
      console.error('Order problem : ', e);
    }
}


const orderModify = (namecurrency,sens,reduceOnly,sizeof) => 
{
    const key = 'bwVG4bDvvEvGN1Uslgg8-IFri_9EuOy0oibElJsf';
    const secret = 'xoPfyLb9IbetNtJ5wXrsCEGCbjEa_6ZHNTX2nnl2';

    const restClientOptions = {
        subAccountName: "BBOT",
    };
  
    const client = new RestClient(key, secret, restClientOptions );
  
    try 
    {
        client.setAccountLeverage(2).catch((error) => {console.error("Error in the leverage" + error);});
        client.getPositions().then(result => 
            {
                result.result.map(name => 
                    {
                        if(name.future === namecurrency+"-PERP" && name.openSize === 0)
                        {
                            console.log("Order not found !")
                        }

                        else if (name.future === namecurrency+"-PERP" && name.openSize !== 0)
                        {
                            client.getMarket(namecurrency+"-PERP").then(res => 
                                {
                                    if(res.result.minProvideSize <= Math.abs(name.openSize) * sizeof)
                                    {
                                        console.log("Adding " + name.openSize * sizeof);
                                        const NewOrderReq = 
                                        {
                                            market: namecurrency+"-PERP",
                                            side: sens.toLowerCase(),
                                            price: null,
                                            type: "market",
                                            size: Math.abs(name.openSize) * sizeof,
                                            reduceOnly: reduceOnly,
                                        }

                                        client.placeOrder(NewOrderReq).catch((error) => {"Error in orderModify placeOrder " + console.error(error);});
                                    }

                                    else
                                    {
                                        console.log("Size too small, unable to modify order")
                                    }
                                })
                        }
                    })
            })
    } catch (e) 
    {
      console.error('OrderModify problem : ', e);
    }
}