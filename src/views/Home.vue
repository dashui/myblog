<template>
  <div class="home">
    <header class="header">
      <h1>个人博客系统</h1>
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
      <section class="hero">
        <h2>欢迎来到我的博客</h2>
        <p>分享知识，记录生活</p>
      </section>
      
      <section class="featured-articles">
        <h3>精选文章</h3>
        <div class="article-grid">
          <div v-for="article in featuredArticles" :key="article.id" class="article-card">
            <router-link :to="`/article/${article.id}`" class="article-link">
              <h4>{{ article.title }}</h4>
              <p class="article-excerpt">{{ article.content.substring(0, 100) }}...</p>
              <div class="article-meta">
                <span>{{ new Date(article.created_at).toLocaleDateString() }}</span>
                <span v-if="article.is_premium" class="premium-badge">付费</span>
              </div>
            </router-link>
          </div>
        </div>
      </section>
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

const featuredArticles = computed(() => articleStore.articles.slice(0, 3))

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
.home {
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

.hero {
  text-align: center;
  padding: 60px 0;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 40px;
}

.hero h2 {
  font-size: 36px;
  margin-bottom: 10px;
  color: #333;
}

.hero p {
  font-size: 18px;
  color: #666;
}

.featured-articles h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.article-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
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

.article-card h4 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.article-excerpt {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
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
