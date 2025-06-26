import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead } from '@/lib/types'

interface LeadFormData {
  business_name: string
  contact_email: string
  business_type: string
  message?: string
}

export function useLeads() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const submitLead = async (formData: LeadFormData) => {
    setIsSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            business_name: formData.business_name,
            contact_email: formData.contact_email,
            business_type: formData.business_type,
            message: formData.message || null,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error submitting lead:', error)
        throw error
      }

      setIsSubmitted(true)
      return data as Lead
    } catch (error) {
      console.error('Failed to submit lead:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setIsSubmitting(false)
  }

  return {
    submitLead,
    isSubmitting,
    isSubmitted,
    resetForm
  }
} 