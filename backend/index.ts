import { Request, Response } from 'express';

export default function handler(req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message: 'PostgresTool Backend - Use /api endpoint',
    endpoints: {
      api: '/api - Main API endpoint',
    },
  });
}
