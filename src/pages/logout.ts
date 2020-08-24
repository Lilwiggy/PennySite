import { Response, Request } from 'express';
exports.run = (req: Request, res: Response) => {
  // leave me
  return `<script>
localStorage.setItem('logged', false);
localStorage.removeItem('t');
window.location.replace('https://penny.wiggy.dev');
</script>`;
};

exports.meta = {
  name: 'logout',
  type: 'get',
};
