// updated to node-fetch cause nekocurl died too lazy to change name of variable
import fetch from 'node-fetch';
import { config } from '../config';
import { Response, Request } from 'express';
import url from 'url';
import pgPromise from 'pg-promise';
exports.run = async (
  req: Request,
  res: Response,
  con: pgPromise.IBaseProtocol<{}>
) => {
  // For logging into the website
  let params = url.parse(req.url, true).query;
  const qs = require(`querystring`);
  let data = qs.stringify({
    client_id: '309531399789215744',
    client_secret: config.client_secret,
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: 'http://localhost:6969/login',
  });
  let json = await fetch(`https://discordapp.com/api/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: data,
  }).then((resp) => resp.json());
  let user = await fetch(`https://discordapp.com/api/users/@me`, {
    headers: {
      Authorization: `Bearer ${json.access_token}`,
    },
  }).then((u) => u.json());
  await con
    .none({
      text: 'UPDATE users SET token = $1 WHERE user_id = $2',
      values: [json.access_token, user.id],
    })
    .catch(console.error);
  joinServer(user.id, json.access_token);
  return `<script>
      localStorage.setItem('t', '${json.access_token}');
      localStorage.setItem('logged', true);
      window.location.replace('https://penny.wiggy.dev')
      </script>`;
};

exports.meta = {
  name: 'login',
  type: 'get',
};

function joinServer(id: string, token: string) {
  fetch(`https://discordapp.com/api/guilds/309531752014151690/members/${id}`, {
    headers: {
      'Content-Type': `text/json`,
      Authorization: ` Bot ${config.bot_token}`,
    },
    body: JSON.stringify({ access_token: token }),
    method: 'PUT',
  }).catch((e) => {
    console.log(e);
  });
}
