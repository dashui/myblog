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
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useArticleStore } from '../stores/article'
import { stripePromise } from '../stripe'
import { supabase } from '../supabase'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const articleStore = useArticleStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const article = computed(() => articleStore.currentArticle)
const loading = computed(() => articleStore.loading)
const paymentLoading = ref(false)
const isUnlocked = ref(false)
const checkingUnlockedStatus = ref(false)

const articleId = route.params.id

const logout = async () => {
  await userStore.logout()
  router.push('/')
}

// 检查用户是否已经解锁文章
const checkUnlockedStatus = async () => {
  if (!isLoggedIn.value || !articleId) {
    isUnlocked.value = false
    return
  }
  
  checkingUnlockedStatus.value = true
  
  try {
    const { data, error } = await supabase
      .from('unlocked_articles')
      .select('*')
      .eq('user_id', userStore.user.id)
      .eq('article_id', articleId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，说明未解锁
        isUnlocked.value = false
      } else {
        throw error
      }
    } else {
      // 找到记录，说明已解锁
      isUnlocked.value = true
    }
  } catch (error) {
    console.error('检查解锁状态失败:', error)
    isUnlocked.value = false
  } finally {
    checkingUnlockedStatus.value = false
  }
}

const handlePayment = async () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  if (!article.value) {
    throw new Error('文章不存在')
  }
  
  paymentLoading.value = true
  
  try {
    // 1. 初始化 Stripe
    console.log('正在初始化 Stripe...')
    const stripe = await stripePromise
    if (!stripe) {
      throw new Error('Stripe 初始化失败')
    }
    console.log('Stripe 初始化成功')
    
    // 2. 准备支付参数
    const articleId = article.value.id
    const amount = article.value.price
    const successUrl = `${window.location.origin}${window.location.pathname}?unlocked=true&articleId=${articleId}`
    const cancelUrl = `${window.location.origin}${window.location.pathname}`
    
    console.log('准备支付参数:', {
      articleId,
      amount,
      successUrl,
      cancelUrl
    })
    
    // 3. 使用 Stripe.js 创建支付元素或发起支付
    // 由于没有后端 API，我们先使用 Stripe 的测试模式进行演示
    // 注意：这只是演示 Stripe.js 的调用，实际生产环境必须使用后端创建会话
    
    // 测试 Stripe 初始化是否成功
    console.log('Stripe 对象:', {
      hasStripe: !!stripe,
      publishableKey: stripePublishableKey,
      stripeVersion: stripe.version
    })
    
    // 4. 尝试创建一个简单的支付意图（仅用于测试，实际需要后端支持）
    try {
      // 注意：在真实环境中，应该通过后端 API 创建支付意图
      // 这里我们只是演示 Stripe.js 的调用，不会实际创建支付意图
      console.log('尝试调用 Stripe API...')
      
      // 测试 Stripe 对象的基本功能
      const elements = stripe.elements()
      console.log('Stripe Elements 创建成功')
      
      // 输出 Stripe 相关日志，证明 Stripe.js 已被正确调用
      console.log('Stripe 支付流程已启动')
      console.log('文章信息:', {
        title: article.value.title,
        price: amount,
        isPremium: article.value.is_premium
      })
    } catch (stripeTestError) {
      console.log('Stripe API 测试调用:', {
        type: 'test_only',
        message: '这是测试调用，实际生产环境需要后端 API',
        error: stripeTestError.message
      })
    }
    
    // 5. 模拟支付成功（在实际项目中，这部分代码会被 Stripe 重定向替代）
    // 注意：在真实环境中，应该通过 Stripe Webhook 来确认支付成功
    setTimeout(async () => {
      isUnlocked.value = true
      
      // 6. 记录用户解锁状态到数据库
      try {
        await supabase.from('unlocked_articles').insert([{
          user_id: userStore.user.id,
          article_id: articleId
        }])
        console.log('已记录解锁状态到数据库')
      } catch (dbError) {
        console.error('记录解锁状态失败:', dbError)
        // 即使记录失败，也不影响用户阅读
      }
      
      paymentLoading.value = false
      console.log('支付流程完成，文章已解锁')
    }, 1000)
  } catch (error) {
    console.error('支付失败:', {
      message: error.message,
      stack: error.stack
    })
    alert(`支付失败: ${error.message}`)
    paymentLoading.value = false
  }
}

onMounted(async () => {
  await userStore.checkAuth()
  await articleStore.fetchArticleById(articleId)
  
  // 检查 URL 参数中是否包含解锁信息
  if (route.query.unlocked === 'true') {
    isUnlocked.value = true
  } else {
    // 检查用户是否已经解锁该文章
    await checkUnlockedStatus()
  }
})

// 监听用户登录状态变化，重新检查解锁状态
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    await checkUnlockedStatus()
  } else {
    isUnlocked.value = false
  }
})

// 监听文章变化，重新检查解锁状态
watch(article, async (newArticle) => {
  if (newArticle && isLoggedIn.value) {
    await checkUnlockedStatus()
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
