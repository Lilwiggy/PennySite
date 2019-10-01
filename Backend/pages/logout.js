exports.run = (req, res) => {
// leave me
  res.write(`<script>
localStorage.setItem('logged', false);
localStorage.removeItem('t');
window.location.replace('https://penny.wiggy.dev');
</script>`);
  res.end();
};


exports.conf = {
  name: 'logout',
};
