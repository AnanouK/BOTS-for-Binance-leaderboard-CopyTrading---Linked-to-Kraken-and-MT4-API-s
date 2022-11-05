const pnlManager = require('..')
require('dotenv').config()

const DELAY = 10000
    
; (async () => {
    const listener = pnlManager.listen({
        encryptedUid: process.env.BINANCE_ENCRYPTED_USER_ID,
        delay: DELAY,
        tradeType: "PERPETUAL"
    })
    listener.on('update', (data) => {
        console.log(data)
        console.log('[ OK ] Got update [' + (new Date()).toGMTString() + "]")
    })
})()