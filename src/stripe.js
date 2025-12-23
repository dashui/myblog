import { loadStripe } from '@stripe/stripe-js'

// 使用环境变量获取 Stripe publishable key
// 在 Vercel 中设置 VITE_STRIPE_PUBLISHABLE_KEY 环境变量
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Sg2IL7TmLmUB1fC5JLdPhgsNbOBV2N9uxZtthgDHMrTQHAbu2LtE5lhTEewUOYx2MQATgrvusRRCw07aBDbSOZ200QWMsa37j'

export const stripePromise = loadStripe(stripePublishableKey)
