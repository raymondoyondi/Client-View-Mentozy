import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const razorpay = new Razorpay({
      key_id: 'rzp_test_SbsDY1EgH8rPZb',
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(PORT, 'localhost', () => {
  console.log(`Razorpay backend running on http://localhost:${PORT}`);
});
