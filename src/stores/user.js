import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user
  },
  
  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      this.loading = true
      
      try {
        await supabase.auth.signOut()
        this.user = null
        localStorage.removeItem('user')
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async checkAuth() {
      this.loading = true
      
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          this.user = data.session.user
          localStorage.setItem('user', JSON.stringify(data.session.user))
        } else {
          this.user = null
          localStorage.removeItem('user')
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})