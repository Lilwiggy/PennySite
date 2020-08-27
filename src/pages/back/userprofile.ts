import fs from 'fs';
import { Response, Request } from 'express';
import pgPromise from 'pg-promise';
import { replaceItems, getUser } from '../../modules/functions';
exports.run = async (
  req: Request,
  res: Response,
  con: pgPromise.IBaseProtocol<{}>
) => {
  // Check your profile here
  let token = req.headers.authorization;
  console.log(token);
  if (!token || token === 'null') {
    let body = await fs.promises
      .readFile('../pages/front/error.html', 'utf-8')
      .catch(console.error);
    body = replaceItems(
      ['{{error}}'],
      ["You're not logged in!"],
      body as string
    );
    return body;
  }
  let user = await con.manyOrNone({
    text:
      'SELECT background, xp, next, level, used, credits, cookies, user_id FROM users WHERE token = $1',
    values: [token],
  });
  console.log(user);
  if (user.length < 1) {
    let body = await fs.promises
      .readFile('../pages/front/error.html', 'utf-8')
      .catch(console.error);
    body = replaceItems(
      ['{{error}}'],
      [
        'I could not find that user in my database. Try talking to the bot on Discord :D',
      ],
      body as string
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
  let userFetch = await getUser(id);
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
