import fetch from 'node-fetch';
import fs from 'fs';
import { config } from './../config';
import { Response, Request } from 'express';
import pgPromise from 'pg-promise';
import { replaceItems } from '../modules/functions';
exports.run = async (
  req: Request,
  res: Response,
  con: pgPromise.IBaseProtocol<{}>
) => {
  // Check your profile here
  let token = req.headers.authorization;
  console.log(token);
  if (!token || token === 'null') {
    let body = await fs.promises.readFile(`./pages/error.html`, 'utf-8');
    body = replaceItems(['{{error}}'], ["You're not logged in!"], body);
    return body;
  }
  let user = await con.manyOrNone({
    text:
      'SELECT background, xp, next, level, used, credits, cookies, user_id FROM users WHERE token = $1',
    values: [token],
  });
  if (user.length < 1) {
    let body = await fs.promises.readFile(`./pages/error.html`, 'utf-8');
    body = replaceItems(
      ['{{error}}'],
      [
        'I could not fund that user in my database. Try talking to the bot on Discord :D',
      ],
      body
    );
    return body;
  }
  let id = user[0].user_id;
  if (user.length === 0 || !id) {
    fs.readFile(`./error.html`, `utf-8`, (e, result) => {
      let body = result;
      body = replaceItems(
        ['{{error}}'],
        [
          'I could not find that user in my database. Try talking to the bot on Discord :D',
        ],
        body
      );
      return body;
    });
  }
  let userFetch = await fetch(`https://discordapp.com/api/users/${id}`, {
    headers: {
      'Content-Type': 'text/json',
      Authorization: `Bot ${config.bot_token}`,
    },
  }).then((u) => u.json());
  return {
    success: true,
    user: {
      id: userFetch.id,
      username: userFetch.username,
      credits: user[0].credits,
      cookies: user[0].cookies,
      xp: user[0].xp,
      level: `${user[0].level}/${user[0].next}`,
      used: user[0].used,
      background: user[0].background,
    },
  };
};

exports.meta = {
  name: 'userprofile',
  type: 'get',
};
