require('colors');
// const axios = require('axios');
const request = require('request-promise');
const mysql = require('mysql2/promise');

//const coinid = 2423;
const coin_symbol = 'BEAM';
const confirmations = 240;
const api = 'http://127.0.0.1:666';

module.exports = async function() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'mysqluser',
    password: 'mysqlpassword',
    database: 'beam',
  });
  const [blocks, fields] = await connection.execute(`SELECT * FROM blocks`);
  const data = JSON.parse(await request.get(`${api}/status`));
  for (const block of blocks) {
    try {
      const apiBlock = JSON.parse(await request.get(`${api}/block?height=${block.height}`));
      console.log("height " + block.height + " hash :" + apiBlock.hash);
      if (typeof apiBlock === 'undefined' || (!apiBlock || !apiBlock.hash)) {
	console.log("hash not found in API, skipping");
	continue;
      }
      if (block.blockhash == apiBlock.hash) {
        // If they equal update conf count
        const difference = data.height - block.height;
        console.log('Block Height Confirmed: ', block.height, difference, `${difference >= confirmations}`.yellow);
        // if conf count >= 1440 mark as generated

	if (difference >= confirmations) {
          await connection.execute('UPDATE blocks SET confirmations = ?, category = ? WHERE id = ?', [
            difference,
            'generate',
            block.id,
          ]);
        } else {
	  console.log("updating blocks confirms " + difference + " for block " + block.id);
          await connection.execute('UPDATE blocks SET confirmations = ? WHERE id = ?', [difference, block.id]);
        }

      } else {
        // Set block to orphan
        console.log(`Block ${block.height} ORPHAN`.red, block.blockhash, apiBlock.hash);
        await connection.execute('UPDATE blocks SET category = ? WHERE id = ?', ['orphan', block.id]);
      }
    } catch (e) {
      console.log('Error fetching block from API: '.red, e.message);
    }
  }
  //console.log('Done'.green);
  connection.close();
};

//start()
// 
//setInterval(() => {
//    start()
// }, 1000 * 30)
