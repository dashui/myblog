// Vercel Serverless Function - ES Module 格式
// 用于创建 Stripe 支付会话
import Stripe from 'stripe';

// 从 Vercel 环境变量获取 Stripe 私钥
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { articleId, amount, successUrl, cancelUrl } = req.body;

    // 验证金额
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // 创建 Stripe 支付会话
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: `解锁文章 #${articleId}`,
            },
            unit_amount: Math.round(amount * 100), // 转换为分
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      // 添加元数据，用于 webhook 处理
      metadata: {
        articleId,
        userId: req.body.userId, // 从请求中获取用户 ID
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return res.status(500).json({ error: error.message });
  }
}
