import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useUserStore } from './user'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    currentArticle: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchArticles() {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        this.articles = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async fetchArticleById(id) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        this.currentArticle = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async createArticle(title, content, isPremium = false, price = 0) {
      this.loading = true
      this.error = null
      
      try {
        // 获取用户 store 实例，从中获取当前用户 ID
        const userStore = useUserStore()
        const authorId = userStore.user?.id
        
        if (!authorId) {
          throw new Error('用户未登录')
        }
        
        const { data, error } = await supabase
          .from('articles')
          .insert([
            {
              title,
              content,
              is_premium: isPremium,
              price,
              author_id: authorId
            }
          ])
          .select()
        
        if (error) throw error
        this.articles.unshift(data[0])
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})