<template>
  <div class="article-detail-container">
    <header class="header">
      <h1>博客文章</h1>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/articles">文章列表</router-link>
        <div v-if="!isLoggedIn">
          <router-link to="/login">登录</router-link>
        </div>
        <div v-else>
          <router-link to="/dashboard">仪表盘</router-link>
          <button @click="logout" class="logout-btn">退出登录</button>
        </div>
      </nav>
    </header>
    
    <main class="main">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="!article" class="not-found">文章不存在</div>
      
      <div v-else class="article-detail">
        <h2>{{ article.title }}</h2>
        <div class="article-meta">
          <span>{{ new Date(article.created_at).toLocaleDateString() }}</span>
          <span v-if="article.is_premium" class="premium-badge">付费</span>
        </div>
        
        <div v-if="article.is_premium && !isUnlocked" class="premium-content-locked">
          <h3>此文章为付费内容</h3>
          <p>解锁后即可阅读完整内容</p>
          <div class="price">价格：{{ article.price }} 元</div>
          <button @click="handlePayment" :disabled="paymentLoading" class="payment-btn">
            {{ paymentLoading ? '处理中...' : '立即解锁' }}
          </button>
        </div>
        
        <div v-else class="article-content">
          <p>{{ article.content }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useArticleStore } from '../stores/article'
import { stripePromise } from '../stripe'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const articleStore = useArticleStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const article = computed(() => articleStore.currentArticle)
const loading = computed(() => articleStore.loading)
const paymentLoading = ref(false)
const isUnlocked = ref(false)

const articleId = route.params.id

const logout = async () => {
  await userStore.logout()
  router.push('/')
}

const handlePayment = async () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  paymentLoading.value = true
  
  try {
    // 实际生产环境中，应该调用后端 API 创建支付订单
    // 这里使用模拟支付流程，部署到 Vercel 后可以替换为真实的支付 API 调用
    
    // 1. 调用后端 API 创建支付会话（示例代码）
    // const response = await fetch('/api/create-payment-session', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     articleId: article.value.id,
    //     amount: article.value.price,
    //     successUrl: window.location.href + '?unlocked=true',
    //     cancelUrl: window.location.href
    //   }),
    // })
    
    // const { sessionId } = await response.json()
    
    // 2. 使用 Stripe.js 发起支付（示例代码）
    // const stripe = await stripePromise
    // const { error } = await stripe.redirectToCheckout({
    //   sessionId,
    // })
    
    // if (error) {
    //   throw error
    // }
    
    // 模拟支付成功（仅用于演示，部署到 Vercel 后应替换为真实支付流程）
    setTimeout(() => {
      isUnlocked.value = true
      // 可以在这里调用 API 更新用户解锁状态
      // await supabase.from('unlocked_articles').insert([{
      //   user_id: userStore.user.id,
      //   article_id: article.value.id
      // }])
      paymentLoading.value = false
    }, 1000)
  } catch (error) {
    console.error('支付失败:', error)
    alert('支付失败，请稍后重试')
    paymentLoading.value = false
  }
}

onMounted(async () => {
  await userStore.checkAuth()
  await articleStore.fetchArticleById(articleId)
  
  // 检查 URL 参数中是否包含解锁信息
  if (route.query.unlocked === 'true') {
    isUnlocked.value = true
  }
})
</script>

<style scoped>
.article-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.nav {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.nav a:hover {
  color: #007bff;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #c82333;
}

.main {
  margin-top: 40px;
}

.loading, .not-found {
  text-align: center;
  padding: 60px 0;
  color: #666;
  font-size: 18px;
}

.article-detail {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-detail h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.premium-badge {
  background-color: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.premium-content-locked {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 40px 0;
}

.premium-content-locked h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.premium-content-locked p {
  color: #666;
  margin-bottom: 20px;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 30px;
}

.payment-btn {
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.payment-btn:hover {
  background-color: #0056b3;
}

.payment-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.article-content {
  color: #333;
  line-height: 1.8;
  font-size: 16px;
}

.article-content p {
  margin-bottom: 20px;
}
</style>
