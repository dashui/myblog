// Vercel Serverless Function - ES Module 格式
// 用于处理 Stripe webhook 事件
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
});

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Stripe webhook 签名密钥
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 验证 Stripe webhook 签名
    const sig = req.headers['stripe-signature'];
    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: 'Missing webhook signature or secret' });
    }

    // 获取请求体
    const buf = await buffer(req);
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        webhookSecret
      );
      console.log('Webhook event verified:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // 处理支付成功事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);

      // 从会话元数据中获取文章 ID 和用户 ID
      // 注意：需要在创建会话时添加这些元数据
      const articleId = session.metadata?.articleId;
      const userId = session.metadata?.userId;

      if (!articleId || !userId) {
        console.error('Missing articleId or userId in session metadata');
        return res.status(200).json({ received: true });
      }

      // 将用户解锁状态记录到数据库
      const { data, error } = await supabase.from('unlocked_articles').insert([{
        user_id: userId,
        article_id: articleId
      }]);

      if (error) {
        console.error('Failed to record unlocked article:', error);
      } else {
        console.log('Successfully recorded unlocked article:', data);
      }
    }

    // 处理其他 Stripe 事件（可选）
    // if (event.type === 'payment_intent.succeeded') {
    //   // 处理支付意图成功事件
    // }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 辅助函数：将请求体转换为 buffer
async function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
