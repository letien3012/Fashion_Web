const paypal = require("@paypal/checkout-server-sdk");
require("dotenv").config();

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

exports.createOrder = async (req, res) => {
  try {
    console.log("==== PAYPAL CREATE ORDER ====");
    console.log("req.body:", req.body);
    console.log(
      "PAYPAL_CLIENT_ID:",
      clientId ? clientId.slice(0, 4) + "..." + clientId.slice(-4) : "undefined"
    );
    console.log(
      "PAYPAL_CLIENT_SECRET:",
      clientSecret
        ? clientSecret.slice(0, 4) + "..." + clientSecret.slice(-4)
        : "undefined"
    );
    const { total_price } = req.body;
    console.log("total_price:", total_price);
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (Number(total_price) / 24000).toFixed(2), // Tỷ giá mẫu
          },
        },
      ],
      application_context: {
        return_url:
          process.env.PAYPAL_RETURN_URL ||
          "http://localhost:5173/paypal-return",
        cancel_url:
          process.env.PAYPAL_CANCEL_URL || "http://localhost:5173/checkout",
      },
    });
    const order = await client.execute(request);
    const approveUrl = order.result.links.find(
      (link) => link.rel === "approve"
    ).href;
    res.json({ approveUrl });
  } catch (error) {
    console.error("PayPal createOrder error:", error.message, error.stack);
    res.status(500).json({
      message: "Lỗi tạo order PayPal",
      error: error.message,
      stack: error.stack,
    });
  }
};

exports.captureOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await client.execute(request);
    res.json({ success: true, details: capture.result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi xác thực PayPal", error: error.message });
  }
};
