import { useState, useEffect } from 'react'
import { supabase, type Company, type Motor, type Job, type Invoice, type Warranty, type User } from '../lib/supabase'

// Error handling utility
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
    return 'Database tables not found. Please ensure the database schema is properly set up.'
  }
  return error?.message || 'An unexpected error occurred'
}

// Companies hook
export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompanies(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const addCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'motor_count' | 'active_jobs'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...company,
          motor_count: 0,
          active_jobs: 0
        }])
        .select()
        .single()

      if (error) throw error
      setCompanies(prev => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      console.error('Add company error:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCompanies(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      throw new Error(handleSupabaseError(err))
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  return { companies, loading, error, addCompany, updateCompany, refetch: fetchCompanies }
}

// Motors hook
export const useMotors = () => {
  const [motors, setMotors] = useState<Motor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMotors = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('motors')
        .select(`
          *,
          companies (
            name,
            contact_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMotors(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const addMotor = async (motor: Omit<Motor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('motors')
        .insert([motor])
        .select()
        .single()

      if (error) throw error
      await fetchMotors() // Refetch to get company data
      return data
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      console.error('Add motor error:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchMotors()
  }, [])

  return { motors, loading, error, addMotor, refetch: fetchMotors }
}

// Jobs hook
export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            contact_name
          ),
          motors (
            motor_id,
            manufacturer,
            model
          ),
          users (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const addJob = async (job: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'progress_percentage'>) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...job, progress_percentage: 0 }])
        .select()
        .single()

      if (error) throw error
      await fetchJobs() // Refetch to get related data
      return data
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      console.error('Add job error:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchJobs() // Refetch to get updated data
      return data
    } catch (err) {
      throw new Error(handleSupabaseError(err))
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return { jobs, loading, error, addJob, updateJob, refetch: fetchJobs }
}

// Invoices hook
export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          companies (
            name,
            contact_name,
            email
          ),
          jobs (
            job_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoice])
        .select()
        .single()

      if (error) throw error
      await fetchInvoices() // Refetch to get related data
      return data
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      console.error('Add invoice error:', errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return { invoices, loading, error, addInvoice, refetch: fetchInvoices }
}

// Warranties hook
export const useWarranties = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWarranties = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('warranties')
        .select(`
          *,
          companies (
            name
          ),
          motors (
            motor_id
          ),
          jobs (
            job_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWarranties(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarranties()
  }, [])

  return { warranties, loading, error, refetch: fetchWarranties }
}

// Users hook
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(handleSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { users, loading, error, refetch: fetchUsers }
}