var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Luas = require('./xacml/luas');
var policyFiles = ["./comformance/3/policies/IIIA001Policy.xacml3.xml"];
var luas;


app.get('/getDecision', async function (req, res) {
  try {
    const luas = new Luas(policyFiles);
    const result = await luas.config();
    var decision = await luas.evaluate('./comformance/3/requests/IIIA001Request.xacml3.xml');
    res.json({ decision });
  } catch (err) {
    console.error(err);
    return err;
  }
});

app.get('/setConfig', function (req, res) {
  luas = new SimplePDP(policyFiles);
  res.send('Config Done');
});

app.use(bodyParser.json());

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('njsPDP listening at http://%s:%s', host, port);

});