const axios =  require('axios');

let MetaApi = require('metaapi.cloud-sdk').default;

// Note: for information on how to use this example code please read https://metaapi.cloud/docs/client/usingCodeExamples

let token = process.env.TOKEN || 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAxNzE5LCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.WbxN3-T555fI3KqzUvSuWrunVjxVL3LynXFrNzfaN2LgW7EeFoN7_K7kE5rb9tGunMBZQ6nkm_E2BEt5aIzy6IHzoBCVyIUZV7po8JAPIsvqsnIVo3Orul-LJp6qRED0Be_ZL5kr-tSHvA629o5_RaGksKSD9u6nE2Th89jkjk2g8CpttaefWH9O-jzT9MTECAWg1tHUy_ktOsoEqv3oTQ3OSS6nRQqxK3VEzXsPgrHWm9eOZWMiYmaN1QHrLbhbmubGazVkI88cSEOO168r4Hp6h7OnKM91GF35L9x9upohhLWqZzVSM7c_0Rgn-a2-e1PFH0hcecIC-qv_qp9NHsW3v07_F0szAIpZpv56q3cfDznNJBK47_Hak1VZ_X11Slsrjs0prEf48XhIT2LwiFCO1DVDQkXJqjTaN-PdYwEGMH1hd-_HQadBqLnnY4a7YC-5FZBtEUiHLIAwtqBlU5dl5EDbqDs_D2bGxe6DiloAoLj3ti_yHosUUEfoeLkgDKBFdOLBsZ1MeEOPHlqOA17SAL9gZQ2YNMUnq6M6y0qeIxPjikNNrY550zUQV9dStAmZAh3JEOLU_CkTxxZzR65D8XhX_DgL9juHzrU0lUw2MiIRGT3GSeeuzimlcyfu7TXq3053Y5g9_k2XIerYVkioMIzA78XVntVkLYpLQUM';
let login = process.env.LOGIN || '890526818';


const api = new MetaApi(token);

async function testMetaApiSynchronization() {
  try {

    /*await axios.post("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/trade",
        { 
            "actionType": "ORDER_TYPE_SELL",
            "symbol": "BTCUSD",
            "volume": 0.01
        },
        {headers : {
            "Content-Type": "application/json",
            "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY" }
        },

        ).then(result => console.log(result));

    await axios.get("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/positions",
    {headers : {
        "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY"

        }
    },
    { 
        "accountId": "36c532e6-1652-458d-818e-0a029d33466d"
    }

    ).then(result => console.log(result));*/

    var position = []

    await axios.get("https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/36c532e6-1652-458d-818e-0a029d33466d/positions",
    {headers : {
        "auth-token" : "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiNzhkNTllNWUzY2EyNzk2MGIzYWY0MTIyODI0ZjBhMCIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjY4NzAzMDgwLCJyZWFsVXNlcklkIjoiYjc4ZDU5ZTVlM2NhMjc5NjBiM2FmNDEyMjgyNGYwYTAifQ.HjxPLfeOlY_Ggrf5_5rS5V6edXwGJrhtk8NG5KuFPQTaa0bbfu9GvkND5U6CrN9W1LoITJWOeGv4Ut578vtwpE61EHOFIhkHmNfZMYY2qbgJPsvVO7E8B1TdzAXSiOWkTBjx__ANzb7RV5mClG53HsV4nTgoIJqd3AJnASwWCWWOFF3OTtyfihojx1iJUb9T7qalb8a2SwhfKqTcqxw7J0egggWSFKXkTsX4wVgGMINdHeZmqo8Xd38yR-hGQNgGtbF0xT8TkUM3uG41tlAtqIUW-Sl_nJxvwPNVPkU6IoaRQR0kOQLtYSqu1dJsn8KaSPvy-nusiv52ujOpmRk0UDPodQz8xdCqlGP0n1Ie9qnTjxg6BQxwii1tzJ1-7vIYw2Tib0r4LwMARLb74S_UJ3lh568bNNa82xhEJXZSXALQWdCEbwg_iLKfuBCBkSRj4oAhwngv4k-H7S5lQFM83nDjKF9E_q_VtiXlWP2tfJELpCwLsMIhfIKxlzudImxa6UK93jklZ1uw-x3jgRoyO4Bxq3NwKEGNPskynY_Q1tVXBEuZaGrT3I48gzEsGOC8_9lo3KahISLv2UqiLAG70Z_bw3ZH_wBgKQlwhfC7Gj5rGmYWX2ZTNpQSQT0r2Zw_eSHeWRoyX3e8v0TXDpnetDiymfOjersCtu2kiU6_7LY"

        }
    },
    { 
        "accountId": "36c532e6-1652-458d-818e-0a029d33466d"
    }

    ).then(result => position = result.data);
    console.log(position)

  } catch (err) {
    // process errors
    if(err.details) {
      // returned if the server file for the specified server name has not been found
      // recommended to check the server name or create the account using a provisioning profile
      if(err.details === 'E_SRV_NOT_FOUND') {
        console.error(err);
      // returned if the server has failed to connect to the broker using your credentials
      // recommended to check your login and password
      } else if (err.details === 'E_AUTH') {
        console.log(err);
      // returned if the server has failed to detect the broker settings
      // recommended to try again later or create the account using a provisioning profile
      } else if (err.details === 'E_SERVER_TIMEZONE') {
        console.log(err);
      }
    }
    console.error(err);
  }
  process.exit();
}

testMetaApiSynchronization();