exports.query = function(req, res) {
    let mapRegister = new Map();
    let arrayId = [];
    const { Client } = require('pg')
    const client = new Client({
        host: process.env.HOST,
        database: process.env.DATABASE,
        user: process.env.USER,
        password: process.env.PASSWORD,
        port: process.env.PORTBD,
        ssl: true
    })
    client.connect() 
    
    function mapToJson(map){
        return JSON.stringify([...map])
    }

    const registers = client.query('SELECT * FROM CLIENTS ORDER BY MessageId ASC LIMIT 30000;')
        .then((resSelect)=>{
            for(const client of resSelect.rows){
                arrayId.push(client.id);
                if(mapRegister.get(client.messageid) === undefined) {
                    mapRegister.set(client.messageid, []);
                    mapRegister.get(client.messageid).push(client);
                } else {
                    mapRegister.get(client.messageid).push(client);
                }
            }
            console.log(mapRegister)
            if(resSelect.rows.length > 0 ) {
                const deleted = client.query(`DELETE FROM CLIENTS WHERE id IN (${arrayId});`)
                    .then((resDelete)=> {
                        if(mapRegister.size > 0) {
                            res.send(mapToJson(mapRegister));
                        }
                        client.end()
                    })
                    .catch((err)=>
                        console.log('err',err)
                    )
            } else {
                res.send(mapToJson(mapRegister));
                client.end()                
            }
        })
        .catch((err)=>{
            res.send('Error',err)
        }
    )
} 
