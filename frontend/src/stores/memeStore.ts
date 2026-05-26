import { create } from 'zustand'
import type { MemeAIResult, Template } from '@/lib/types'

interface MemeState {
  selectedTemplate: Template | null
  generatedMeme: MemeAIResult | null
  isGenerating: boolean
  setSelectedTemplate: (template: Template | null) => void
  setGeneratedMeme: (meme: MemeAIResult | null) => void
  setGenerating: (generating: boolean) => void
}

export const useMemeStore = create<MemeState>((set) => ({
  selectedTemplate: null,
  generatedMeme: null,
  isGenerating: false,
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setGeneratedMeme: (generatedMeme) => set({ generatedMeme }),
  setGenerating: (isGenerating) => set({ isGenerating }),
}))
