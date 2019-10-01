// updated to node-fetch cause nekocurl died too lazy to change name of variable
const neko = require(`node-fetch`);
const conf = require(`../config.json`);
const url = require('url');
exports.run = (req, res, con) => {
// For logging into the website
  let params = url.parse(req.url, true).query;
  const qs = require(`querystring`);
  let data = qs.stringify({
    client_id: '309531399789215744',
    client_secret: conf.client_secret,
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: 'https://penny.wiggy.dev/login',
  });
  neko(`https://discordapp.com/api/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: data,
  }).then((resp) => resp.json())
    .then((json) => {
      res.write(`<script>
    localStorage.setItem('t', '${json.access_token}');
    localStorage.setItem('logged', true);
    </script>`);
      neko(`https://discordapp.com/api/users/@me`, {
        headers: {
          Authorization: ` Bearer ${json.access_token}`,
        },
      }).then((u) => u.json()).then((user) => {
        con.query(`UPDATE \`User\` SET \`token\` = '${json.access_token}' WHERE \`User_ID\` = ${user.id}`);
        joinServer(user.id, json.access_token);
        res.write(`<script>
      window.location.replace('https://penny.wiggy.dev')
      </script>`);
        res.end();
      });
    });
};


exports.conf = {
  name: 'login',
};


function joinServer(id, token) {
  neko(`https://discordapp.com/api/guilds/309531752014151690/members/${id}`, {
    headers: {
      'Content-Type': `text/json`,
      Authorization: ` Bot ${conf.bot_token}`,
    },
    data: JSON.stringify({ access_token: token }),
    method: 'PUT',
    json: true,
  }).catch((e) => {
    console.log(e);
  });
}
