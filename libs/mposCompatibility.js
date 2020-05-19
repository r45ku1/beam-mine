var algos = require('stratum-pool/lib/algoProperties.js');
var cluster = require('cluster');

const mysql = require('mysql');

module.exports = function(logger, poolConfig) {
  const mposConfig = poolConfig.mposMode;
  const coin = poolConfig.coin.name;

  const connection = mysql.createPool({
    host: mposConfig.host,
    port: mposConfig.port,
    user: mposConfig.user,
    password: mposConfig.password,
    database: mposConfig.database,
  });

  const query = (...args) => {
    return new Promise((resolve, reject) => {
      connection.query(args[0], args[1], function(err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });
  };

  const logIdentify = 'MySQL';
  const logComponent = coin;
 
  if (cluster.worker.id == 1) {
    var ports = Object.keys(poolConfig.ports);
    const pid = process.env.pid;
    const timestamp = Math.round(+new Date() / 1000);
    const algo = 'beamHashII'; // poolConfig.coin.algorithm;
    // const url = "url";
    const port = ports[0];
    const symbol = poolConfig.coin.symbol;
  }

  function roundFix(number, precision) {
    var multi = Math.pow(10, precision);
    return Math.round((number * multi).toFixed(precision + 1)) / multi;
  }

  //
  // Auth
  //
  this.handleAuth = async function(rawip, port, workerName, authCallback) {
    const ip = /\d.*/.exec(rawip)[0];
    try {
      if (!workerName) {
        authCallback(false, poolWorkerId, poolUserId, poolCoinId);
      }

      const symbol = poolConfig.coin.symbol;
      //const coinData = await query('SELECT id FROM coins WHERE symbol = ?', [symbol]);
      const wallet = workerName.toString().split('.')[0];
      const rigname = workerName.toString().split('.')[1];
      const pid = process.env.pid;
      const timestamp = Math.round(+new Date() / 1000);
      const coinid = 2423;//coinData[0].id;
      //const algo = 'beamHashII'; //poolConfig.coin.algorithm;
      // const port = poolConfig.initStats.stratumPorts[0];
      const url = 'url';
      const accountData = await query('SELECT id FROM accounts WHERE username = ?', [wallet]);
      let userid;

      // ****** TODO handle password and -p c= and -p mp=
      var ports = Object.keys(poolConfig.ports)[0];
      //const stratumDiff = 100;//todopoolConfig.ports[ports];
      // console.log("**** ports:" + JSON.stringify(poolConfig.ports[0]));
      // data to pass back to stratum-pool
      var callbackData = {
        poolCoinId: coinid,
        poolUserId: null,
        poolWorkerId: null,
        userSetDifficulty: null, // or hard code a test number
      };

      let stratumDiff = poolConfig.ports[port].diff;
      callbackData.userSetDifficulty = stratumDiff;

      if (!accountData[0]) {
        const accounts = await query(
          'INSERT INTO accounts (coinid, username, ip) values (?, ?, ?);',
          [coinid, wallet, ip],
        );

        console.log('New Account:' + wallet + ' userid:' + accounts.insertId + ' ip:' + ip);
        userid = accounts.insertId;
      } else {
        userid = accountData[0].id;
      }

      // todo handle this from config

      result = await query(
        'INSERT INTO workers (userid, ip, name, difficulty, rigname, time) VALUES (?, ?, ?, ?, ?, ?)',
        [coinid, ip, wallet, stratumDiff, rigname, timestamp],
      );
      callbackData.poolWorkerId = result.insertId;
      callbackData.poolUserId = userid;
      callbackData.poolCoinId = coinid;
      authCallback(true, callbackData);
    } catch (err) {
      console.error(err);
      authCallback(false, callbackData);
      logger.error(logIdentify, logComponent, 'Database error when authenticating account: ' + JSON.stringify(err));
    }
  };


  this.handleBlock = async function(shareData) {
    let blockHash = shareData['blockhash'];

    const timestamp = Math.round(+new Date() / 1000);

    try {
      const result = await query(
        'INSERT INTO blocks (time, userid, workerid, height, sharediff, reward, blockdiff, jobid, blockhash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          timestamp,
          shareData.poolUserId,
          shareData.poolWorkerId,
          shareData.height,
          shareData.shareDiff,
          shareData.blockReward,
          shareData.blockDiff,
   	  shareData.id,
          blockHash,
        ],
      );

      if (result) {
         logger.debug(logIdentify, logComponent, 'Block inserted')
      }
    } catch (err) {
      logger.error(logIdentify, logComponent, 'Insert error when adding block: ' + JSON.stringify(err));
    }
  };

  
    this.handleBlockUpdate = async function(reply) {
      console.log("*** MPOS handleBlockUpdate(): " + JSON.stringify(reply));
      const blockHash = reply.blockhash;
      const id = reply.id;
      try {
        const result = await query(
          "UPDATE blocks SET blockhash = ? WHERE jobid = ?",
          [blockHash, id]
        );
        if (result.affectedRows === 0) {
          logger.debug(
            logIdentify,
            logComponent,
            "BeamNode Confirmed block -- Updated blockHash successfully" + insertResult
          );
        }
      } catch (err) {
        logger.error(
          logIdentify,
          logComponent,
          "Error when updating blockHash!" 
        );
      }
    };
  

  //
  // Diff
  //
  this.handleDifficultyUpdate = async function(workerName, diff, poolWorkerId) {
    //console.log("****** workerName="+workerName+" diff=" + diff + " poolWorkerId=" + poolWorkerId)
    try {
      const result = await query('UPDATE workers SET difficulty = ? WHERE id = ?', [diff, poolWorkerId]);
      if (result.affectedRows === 0) {
        logger.debug(logIdentify, logComponent, 'Updated difficulty successfully' + insertResult);
      }
    } catch (err) {
      logger.error(
        logIdentify,
        logComponent,
        'Error when updating worker diff: ' +
          diff +
          ' poolWorkerId=' +
          poolWorkerId +
          ' worker:' +
          workerName +
          ' error=' +
          JSON.stringify(err),
      );
    }
  };

  this.handleDisconnect = async function(poolWorkerId) {
    try {
      const result = await query('DELETE from workers WHERE id = ?', [poolWorkerId]);
      if (result.affectedRows === 0) {
      }
    } catch (err) {
      logger.error(logIdentify, logComponent, 'Error when cleaning up worker id : ' + poolWorkerId);
    }
  };
};
