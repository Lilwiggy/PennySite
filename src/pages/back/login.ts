// updated to node-fetch cause nekocurl died too lazy to change name of variable
import fetch from 'node-fetch';
import { config } from '../../config';
import { Response, Request } from 'express';
import { getCurrentUser, getToken, getGuilds } from '../../modules/functions';
import url from 'url';
import pgPromise from 'pg-promise';
import qs from 'querystring';
exports.run = async (
  req: Request,
  res: Response,
  con: pgPromise.IBaseProtocol<{}>
) => {
  // For logging into the website
  let params = url.parse(req.url, true).query;
  let data = qs.stringify({
    client_id: '309531399789215744',
    client_secret: config.client_secret,
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: 'http://localhost:6969/login',
  });
  let token = await getToken(data);
  console.log(await getGuilds(token));
  let user = await getCurrentUser(token);
  await con
    .none({
      text: 'UPDATE users SET token = $1 WHERE user_id = $2',
      values: [token, user.id],
    })
    .catch(console.error);
  joinServer(user.id, token);
  return `<script>
      localStorage.setItem('t', '${token}');
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
      'Content-Type': 'text/json',
      Authorization: `Bot ${config.bot_token}`,
    },
    body: JSON.stringify({ access_token: token }),
    method: 'PUT',
  }).catch((e) => {
    console.log(e);
  });
}
