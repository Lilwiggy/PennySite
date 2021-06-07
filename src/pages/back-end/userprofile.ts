import fetch from 'node-fetch';
import fs from 'fs';
import { config } from '../../config';
import { Response, Request } from 'express';
import pgPromise from 'pg-promise';
import { replaceItems } from '../../modules/functions';
exports.run = async (
  req: Request,
  res: Response,
  con: pgPromise.IBaseProtocol<{}>
) => {
  // Check your profile here
  let token = req.headers.authorization;
  if (!token || token === null) {
    fs.readFile(`./pages/error.html`, `utf-8`, (e, result) => {
      let body = result;
      body = replaceItems(['{{error}}'], ["You're not logged in!"], body);
      return body;
    });
  }
  let user = await con.manyOrNone({
    text:
      'SELECT background, xp, next, level, used, credits, cookies, user_id FROM users WHERE token = $1',
    values: [token],
  });
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
  let cards = await con.manyOrNone({
    text: 'SELECT * FROM cards WHERE owner_id = $1',
    values: [id],
  });
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
      xp: `${user[0].xp}/${user[0].next}`,
      level: user[0].level,
      used: user[0].used,
      background: user[0].background,
      cards: cards,
    },
  };
};

exports.meta = {
  name: 'userprofile',
  type: 'get',
};
