<template>
  <div class="dashboard-container">
    <header class="header">
      <h1>博客文章</h1>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/articles">文章列表</router-link>
        <router-link to="/dashboard" class="active">仪表盘</router-link>
        <button @click="logout" class="logout-btn">退出登录</button>
      </nav>
    </header>
    
    <main class="main">
      <div class="dashboard-header">
        <h2>欢迎，{{ user.email }}</h2>
        <button @click="showCreateForm = !showCreateForm" class="create-btn">
          {{ showCreateForm ? '取消' : '创建新文章' }}
        </button>
      </div>
      
      <!-- 创建文章表单 -->
      <div v-if="showCreateForm" class="create-form-container">
        <h3>创建新文章</h3>
        <form @submit.prevent="handleCreateArticle" class="create-form">
          <div class="form-group">
            <label for="title">标题</label>
            <input
              type="text"
              id="title"
              v-model="newArticle.title"
              required
              placeholder="请输入文章标题"
            />
          </div>
          <div class="form-group">
            <label for="content">内容</label>
            <textarea
              id="content"
              v-model="newArticle.content"
              required
              placeholder="请输入文章内容"
              rows="10"
            ></textarea>
          </div>
          <div class="form-group premium-settings">
            <label>
              <input
                type="checkbox"
                v-model="newArticle.isPremium"
              />
              设为付费文章
            </label>
            <div v-if="newArticle.isPremium" class="price-input">
              <label for="price">价格（元）</label>
              <input
                type="number"
                id="price"
                v-model.number="newArticle.price"
                min="0"
                step="0.01"
                placeholder="请输入价格"
              />
            </div>
          </div>
          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? '创建中...' : '创建文章' }}
          </button>
        </form>
      </div>
      
      <!-- 我的文章列表 -->
      <div class="my-articles">
        <h3>我的文章</h3>
        <div v-if="userArticles.length === 0" class="no-articles">您还没有文章</div>
        <div v-else class="articles-list">
          <div v-for="article in userArticles" :key="article.id" class="article-item">
            <h4>{{ article.title }}</h4>
            <div class="article-info">
              <span>{{ new Date(article.created_at).toLocaleDateString() }}</span>
              <span v-if="article.is_premium" class="premium-badge">付费</span>
              <span v-else class="free-badge">免费</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useArticleStore } from '../stores/article'

const userStore = useUserStore()
const articleStore = useArticleStore()
const router = useRouter()

const showCreateForm = ref(false)
const loading = ref(false)
const newArticle = ref({
  title: '',
  content: '',
  isPremium: false,
  price: 0
})

const user = computed(() => userStore.user)
const userArticles = computed(() => articleStore.articles.filter(article => article.author_id === user.value?.id))

const logout = async () => {
  await userStore.logout()
  router.push('/')
}

const handleCreateArticle = async () => {
  loading.value = true
  
  try {
    await articleStore.createArticle(
      newArticle.value.title,
      newArticle.value.content,
      newArticle.value.isPremium,
      newArticle.value.price
    )
    
    // 重置表单
    newArticle.value = {
      title: '',
      content: '',
      isPremium: false,
      price: 0
    }
    
    showCreateForm.value = false
  } catch (error) {
    console.error('创建文章失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await userStore.checkAuth()
  await articleStore.fetchArticles()
  
  // 如果未登录，重定向到登录页
  if (!user.value) {
    router.push('/login')
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
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

.nav a.active {
  color: #007bff;
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

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  font-size: 28px;
  color: #333;
}

.create-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background-color: #0056b3;
}

.create-form-container {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.create-form-container h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.premium-settings {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.premium-settings label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
}

.price-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input label {
  font-weight: 500;
}

.submit-btn {
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.submit-btn:hover {
  background-color: #218838;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.my-articles {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.my-articles h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.no-articles {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.article-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.article-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-item h4 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.article-info {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.premium-badge {
  background-color: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.free-badge {
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}
</style>
