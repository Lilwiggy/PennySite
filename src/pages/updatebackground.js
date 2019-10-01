// updated to node-fetch cause nekocurl died too lazy to change name of variable
const url = require('url');
const fs = require(`fs`);
exports.run = (req, res, con) => {
// For updating your background
  if (!url.parse(req.url).query) {
    res.write(`<script>
    window.location.replace('https://penny.wiggy.dev/backgrounds')
    </script>`);
    res.end();
  } else {
    let bg = url.parse(req.url).query.split(`b=`)[1];
    let token = req.headers.authorization;
    if (!token) {
      fs.readFile(`./error.html`, `utf-8`, (e, result) => {
        let body = result;
        body = replaceItems(['<h1 style="color: white" id="err"></h1>'],
          [`<h1 style="color: white" id="err">You're not logged in!</h1>`],
          body);
        res.write(body);
        res.end();
      });
      return;
    }
    con.query(`SELECT \`User_ID\` FROM \`User\` WHERE \`token\` = '${token}'`, (e, r) => {
      if (!r[0]) {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({ error: "You're not logged in!" }));
        res.end();
        return;
      }
      let id = r[0].User_ID;

      if (!bg) {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({ error: "Not sure how you did this tbh but you didn't select a background." }));
        res.end();
      } else {
        let shop = require(`../js/shop.json`);
        let shopItems = Object.keys(shop);
        let bgs = [];
        shopItems.forEach((x) => {
          if (shop[x].type === 'background')
            bgs.push(shop[x].name);
        });
        if (!bgs.includes(bg)) {
          res.setHeader('Content-Type', 'application/json');
          res.write(JSON.stringify({ error: "We can't seem to find that background. Try another." }));
          res.end();
        } else {
          con.query(`SELECT COUNT(*) AS \`count\`, \`Credits\` FROM \`User\` WHERE \`User_ID\` = ${con.escape(id)}`, (er, re) => {
            if (re[0].count === 0) {
              res.setHeader('Content-Type', 'application/json');
              res.write(JSON.stringify({ error: "We couldn't find that user in our database. Try talking to the bot on discord :D" }));
              res.end();
            } else {
              con.query(`SELECT * FROM \`userB\` WHERE \`User_ID\` = ${con.escape(id)} AND \`name\` = ${con.escape(bg)}`, (e, d) => {
                if (d.length > 0) {
                  con.query(`UPDATE \`User\` SET \`background\` = ${con.escape(bg)} WHERE \`User_ID\` = ${con.escape(id)}`);
                  res.setHeader('Content-Type', 'application/json');
                  res.write(JSON.stringify({ success: `Equipped ${bg}.` }));
                  res.end();
                } else {
                  con.query(`SELECT \`Credits\` FROM \`User\` WHERE \`User_ID\` = ${con.escape(id)}`, (e, r) => {
                    if (r[0].Credits >= shop[bg].price) {
                      con.query(`UPDATE \`User\` SET \`background\` = '${bg}', \`Credits\`=\`Credits\` -${shop[bg].price} WHERE \`User_ID\` = ${id}`);
                      con.query(`INSERT INTO \`userB\` (\`User_ID\`, \`name\`) VALUES (${id}, '${bg}')`);
                      res.setHeader('Content-Type', 'application/json');
                      res.write(JSON.stringify({ success: `Purchased and equipped ${bg}.` }));
                      res.end();
                    } else {
                      res.setHeader('Content-Type', 'application/json');
                      res.write(JSON.stringify({ error: 'You do not have enough credits for this background!' }));
                      res.end();
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }
};


exports.conf = {
  name: 'updatebackground',
};

function replaceItems(arr, rep, input) {
  for (let i = 0; i < arr.length; i++)
    input = input.replace(arr[i], rep[i]);
  return input;
}
