const http = require('http');

var publicIP = async function () {
  return new Promise((resolve, reject) => {
    var options = {
      host: 'ipv4bot.whatismyipaddress.com',
      port: 80,
      path: '/'
    };

    http.get(options, function (res) {
      res.on("data", function (chunk) {
        resolve(chunk.toString());
      });
    }).on('error', function (e) {
      reject(e.message);
    });

  });
}

exports.handler = async (event) => {
  // TODO implement

  const response = {
    statusCode: 200,
    body: JSON.stringify(await publicIP())
  };
  return response;
};


