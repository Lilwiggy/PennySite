import express from 'express';
import { config } from './config';
import fs from 'fs';
const app = express();

import pgPromise, { IBaseProtocol } from 'pg-promise';
import path from 'path';
const pgp = pgPromise();

const con: IBaseProtocol<{}> = pgp(
  `postgres://${config.sql.username}:${config.sql.password}@${config.sql.host}/${config.sql.db_name}`
);
fs.readdir('./pages', (err, res) => {
  res.forEach((page) => {
    if (!page.endsWith('.html')) return;
    app.get('/', (req, r) =>
      r.sendFile(path.join(`${path.join(__dirname)}/../pages/index.html`))
    );
    app.get('/' + page.split('.')[0], (req, r) =>
      r.sendFile(path.resolve(path.join(__dirname) + `/../pages/${page}`))
    );
  });
});
fs.readdir('./out/pages', (err, res) => {
  res.forEach((page) => {
    if (!page.endsWith('.js')) return;
    try {
      let props = require(`./pages/${page}`);
      switch (props.meta.type) {
        case 'get':
          app.get(`/${props.meta.name}`, async (req, r) => {
            let resp = await props.run(req, r, con);
            r.send(resp);
          });
          break;
        case 'post':
          app.post(`/${props.meta.name}`, async (req, r) => {
            let resp = await props.run(req, r, con);
            r.send(resp);
          });
          break;
      }
    } catch (e) {
      console.log(`Unable to load page ${page}: ${e}`);
    }
  });
});
app.use('/front', express.static(`${path.join(__dirname)}/../front-end`));
app.listen(6969, () => {
  console.log('Listening on port 6969');
});
