export default async function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'PostgresTool Backend API v1.0 ✅',
    timestamp: new Date().toISOString(),
    method: req.method 
  });
}
