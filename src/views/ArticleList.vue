<template>
  <div class="article-list-container">
    <header class="header">
      <h1>博客文章</h1>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/articles" class="active">文章列表</router-link>
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
      <h2>文章列表</h2>
      
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="articles.length === 0" class="no-articles">暂无文章</div>
      
      <div v-else class="articles">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <router-link :to="`/article/${article.id}`" class="article-link">
            <h3>{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.content.substring(0, 150) }}...</p>
            <div class="article-meta">
              <span>{{ new Date(article.created_at).toLocaleDateString() }}</span>
              <span v-if="article.is_premium" class="premium-badge">付费</span>
            </div>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useArticleStore } from '../stores/article'

const userStore = useUserStore()
const articleStore = useArticleStore()
const router = useRouter()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const articles = computed(() => articleStore.articles)
const loading = computed(() => articleStore.loading)

const logout = async () => {
  await userStore.logout()
  router.push('/')
}

onMounted(async () => {
  await userStore.checkAuth()
  await articleStore.fetchArticles()
})
</script>

<style scoped>
.article-list-container {
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

.main h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.loading, .no-articles {
  text-align: center;
  padding: 60px 0;
  color: #666;
  font-size: 18px;
}

.articles {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.article-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.article-link {
  text-decoration: none;
  color: inherit;
}

.article-card h3 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.article-excerpt {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.article-meta {
  display: flex;
  justify-content: space-between;
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
</style>
