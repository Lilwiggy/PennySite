// updated to node-fetch cause nekocurl died too lazy to change name of variable
import url from 'url';
import fs from 'fs';
import { Request, Response } from 'express';
import pgPromise from 'pg-promise';
import { items } from '../../modules/shop';
import { replaceItems } from '../../modules/functions';
exports.run = async (
  req: Request,
  res: Response,
  con: pgPromise.IBaseProtocol<{}>
) => {
  // For updating your background
  if (!url.parse(req.url).query) {
    return `<script>
    window.location.replace('https://penny.wiggy.dev/backgrounds')
    </script>`;
  } else {
    let bg = url.parse(req.url).query!.split(`b=`)[1];
    let token = req.headers.authorization;
    if (!token) {
      fs.readFile(`./pages/front/error.html`, `utf-8`, (e, result) => {
        let body = result;
        body = replaceItems(['{{error}}'], ["You're not logged in!"], body);
        return body;
      });
    }
    let data = await con.manyOrNone({
      text: 'SELECT user_id, credits FROM users WHERE token = $1',
      values: [token],
    });
    if (!data[0])
      return {
        error:
          "We couldn't find that user in our database. Try talking to the bot on discord :D",
      };
    let id: string = data[0].user_id;

    if (!bg)
      return {
        error:
          "Not sure how you did this tbh but you didn't select a background.",
      };
    let shopItems = Object.keys(items);
    let bgs: string[] = [];
    shopItems.forEach((x) => {
      if (items[x].type === 'background') bgs.push(items[x].name);
    });
    if (!bgs.includes(bg))
      return {
        error: "We can't seem to find that background. Try another one.",
      };

    let userOwned = await con.manyOrNone({
      text:
        'SELECT name FROM user_backgrounds WHERE user_id = $1 AND name = $2',
      values: [id, bg],
    });
    if (userOwned.length > 0) {
      await con.none({
        text: 'UPDATE users SET background = $1 WHERE user_id = $2',
        values: [bg, id],
      });
      return { success: `Equipped ${bg}.` };
    } else {
      if (data[0].credits >= items[bg].price) {
        await con.none({
          text:
            'UPDATE users SET background = $1, credits = credits - $2 WHERE user_id = $3',
          values: [bg, items[bg].price, id],
        });
        await con.none({
          text: 'INSERT INTO user_backgrounds (user_id, name) VALUES ($1, $2)',
          values: [id, bg],
        });
        return {
          success: `Purchased and equipped ${bg}.`,
        };
      } else {
        return {
          error: 'You do not have enough credits for this background!',
        };
      }
    }
  }
};

exports.meta = {
  name: 'updatebackground',
  type: 'post',
};
