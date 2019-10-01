const http = require(`https`);
const url = require('url');
// updated to node-fetch cause nekocurl died too lazy to change name of variable
const neko = require(`node-fetch`);
const qs = require(`querystring`);
const mysql = require(`mysql`);
const fs = require(`fs`);
const conf = require(`./config.json`);
const con = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: conf.sql_pass,
  database: 'AangBot',
});
let pages = new Map();

fs.readdir(`./pages`, (err, res) => {
  if (err)
    console.error(err);

  res.forEach((page) => {
    if (!page.endsWith('.js'))
      return;
    try {
      let props = require(`./pages/${page}`);
      pages.set(props.conf.name, props);
    } catch (e) {
      console.log(`Unable to load page ${page}: ${e}`);
    }
  });
});
con.connect();
http.createServer({
  cert: fs.readFileSync('./cert/cert.pem'),
  key: fs.readFileSync('./cert/key.pem'),
}, async(req, res) => {
  let page = req.url.split('/')[1].split('?')[0];
  let cmd = pages.get(page);
  if (!cmd)
    return;

  try {
    cmd.run(req, res, con);
  } catch (e) {
    console.error(e);
  }
}).listen(6969);
console.log(`Listening on port 6969`);
