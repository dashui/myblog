import { defineStore } from 'pinia'
import { supabase } from '../supabase'

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
        const { data, error } = await supabase
          .from('articles')
          .insert([
            {
              title,
              content,
              is_premium: isPremium,
              price,
              author_id: this.user?.id
            }
          ])
          .select()
        
        if (error) throw error
        this.articles.unshift(data[0])
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})