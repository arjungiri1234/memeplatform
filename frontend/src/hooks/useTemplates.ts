import { useCallback, useEffect, useRef, useState } from 'react'
import { getTemplates } from '../lib/supabaseClient'
import type { Template } from '../lib/types'

interface UseTemplatesResult {
  templates: Template[]
  loading: boolean
  error: string | null
  activeCategory: string | null
  filterByCategory: (category: string | null) => void
  refresh: () => void
}

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchTemplates = useCallback(async (category: string | null) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getTemplates(category)

      if (!isMountedRef.current) return

      setTemplates(data)
    } catch (err) {
      if (!isMountedRef.current) return

      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void fetchTemplates(null)
  }, [fetchTemplates])

  const filterByCategory = useCallback(
    (category: string | null) => {
      setActiveCategory(category)
      setTemplates([])
      void fetchTemplates(category)
    },
    [fetchTemplates],
  )

  const refresh = useCallback(() => {
    void fetchTemplates(activeCategory)
  }, [activeCategory, fetchTemplates])

  return {
    templates,
    loading,
    error,
    activeCategory,
    filterByCategory,
    refresh,
  }
}
