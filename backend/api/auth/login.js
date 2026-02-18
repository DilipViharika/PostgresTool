export default async function handler(req, res) {
    // 1. Only allow POST requests for login
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed. Please use POST.'
        });
    }

    // 2. Get data from the request body
    const { email, password } = req.body;

    // 3. Simple validation (Replace this with your real DB check later)
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    // Example: Mock success response
    if (email === "test@test.com" && password === "123456") {
        return res.status(200).json({
            success: true,
            token: "fake-jwt-token-123",
            user: { email: email, name: "Test User" }
        });
    } else {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
}