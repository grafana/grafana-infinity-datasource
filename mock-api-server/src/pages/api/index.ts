import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

export default function handler(req: Req, res: Res) {
  res.status(200).send({ message: 'ok' });
}
