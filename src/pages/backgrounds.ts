import { Request, Response } from 'express';
import { items, ItemInfo } from './../modules/shop';
exports.run = async (req: Request, res: Response) => {
  // Fetch all backgrounds
  let shopItems = Object.keys(items);
  let bgs: ItemInfo[] = [];
  shopItems.forEach((x) => {
    if (items[x].type === 'background') bgs.push(items[x]);
  });
  return bgs;
};

exports.meta = {
  name: 'shop/backgrounds',
  type: 'get',
};
