//var mysql = require('mysql')
var CONFIG = require('./config.json');
const mysql = require('serverless-mysql')({
  config: {
    host     : CONFIG.database.host,
    database : 'infinity',
    user     : CONFIG.database.user,
    password : CONFIG.database.password
  }
})

async function fetch(pid,callback){


  let results = await mysql.query("select * from asset where pid = ? ;", [pid])

  // Run clean up function
  await mysql.end()
  mysql.quit()

  // Return the results
  return callback(null,results)

} 



module.exports = {
   fetch : fetch
};