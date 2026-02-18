export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "PostgresTool Backend - Use /api endpoint",
    endpoints: {
      api: "/api - Main API endpoint"
    }
  });
}
