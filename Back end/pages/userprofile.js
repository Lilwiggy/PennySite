const neko = require(`node-fetch`);
const fs = require(`fs`);
const conf = require(`../config.json`);
exports.run = (req, res, con) => {
// Check your profile here
  let token = req.headers.authorization;
  console.log(req.headers);
  if (!token || token === 'null') {
    fs.readFile(`./error.html`, `utf-8`, (e, result) => {
      let body = result;
      body = replaceItems(['<h1 style="color: white" id="err"></h1>'],
        [`<h1 style="color: white" id="err">You're not logged in!</h1>`],
        body);
      res.write(body);
      res.end();
      console.log(16);
    });
    return;
  }
  con.query(`SELECT \`User_ID\` FROM \`User\` WHERE \`token\` = '${token}'`, (e, r) => {
    if (r.length === 0) {
      fs.readFile(`./error.html`, `utf-8`, (e, result) => {
        let body = result;
        body = replaceItems(['<h1 style="color: white" id="err"></h1>'],
          [`<h1 style="color: white" id="err">You're not logged in!</h1>`],
          body);
        res.write(body);
        res.end();
        console.log(30);
      });
    }
    let id = r[0].User_ID;
    con.query(`SELECT COUNT(*) AS \`count\`, \`background\`, \`XP\`, \`Next\`, \`Used\`, \`Level\`, \`Credits\`, \`Cookie\` FROM \`User\` WHERE \`User_ID\` = ${con.escape(id)}`, (e, r) => {
      if (!id) {
        fs.readFile(`./error.html`, `utf-8`, (e, result) => {
          let body = result;
          body = replaceItems(['<h1 style="color: white" id="err"></h1>'],
            [`<h1 style="color: white" id="err">You're not logged in!</h1>`],
            body);
          res.write(body);
          res.end();
          console.log(43);
        });
      } else if (r[0].count === 0) {
        fs.readFile(`./error.html`, `utf-8`, (e, result) => {
          let body = result;
          body = replaceItems(['<h1 style="color: white" id="err"></h1>'],
            [`<h1 style="color: white" id="err">We couldn't find that user in our data base. Maybe try talking with the bot on discord :D</h1>`],
            body);
          res.write(body);
          res.end();
        });
      } else {
        neko(`https://discordapp.com/api/users/${id}`, {
          headers: {
            'Content-Type': `text/json`,
            Authorization: ` Bot ${conf.bot_token}`,
          },
        }).then((u) => u.json()).then((user) => {
          res.setHeader('Content-Type', 'application/json');
          res.write(JSON.stringify({ success: true, user: {
            id: user.id,
            username: user.username,
            credits: r[0].Credits,
            cookies: r[0].Cookie,
            xp: r[0].XP,
            level: `${r[0].Level}/${r[0].Next}`,
            used: r[0].Used,
            background: r[0].background,
          } }));
          res.end();
        });
      }
    });
  });
};


exports.conf = {
  name: 'userprofile',
};

function replaceItems(arr, rep, input) {
  for (let i = 0; i < arr.length; i++)
    input = input.replace(arr[i], rep[i]);
  return input;
}
