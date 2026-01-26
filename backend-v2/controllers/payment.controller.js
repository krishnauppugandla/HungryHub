const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

// POST /api/payment/intent
// Returns a mock payment intent. Replace with real Stripe integration when ready.
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount = 0 } = req.body;

  // Mock response — wire up Stripe when STRIPE_SECRET_KEY is set in .env
  const clientSecret = `mock_pi_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`;

  success(res, {
    clientSecret,
    amount,
    currency: "usd",
  }, "Payment intent created");
});

module.exports = { createPaymentIntent };
