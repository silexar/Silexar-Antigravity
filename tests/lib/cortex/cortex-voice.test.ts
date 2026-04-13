import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CortexVoice, PREMIUM_VOICES, type VoiceConfig, type SynthesisResult } from '@/lib/cortex/cortex-voice'

// Mock del logger
vi.mock('@/lib/observability', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('Cortex Voice Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Voice Configuration', () => {
    it('should have premium voices defined', () => {
      expect(PREMIUM_VOICES).toBeDefined()
      expect(PREMIUM_VOICES.length).toBeGreaterThan(0)
    })

    it('should have Gemini voices', () => {
      const geminiVoices = PREMIUM_VOICES.filter(v => v.provider === 'GEMINI')
      expect(geminiVoices.length).toBeGreaterThanOrEqual(2)
      expect(geminiVoices.some(v => v.id === 'gemini-pro-voice-1')).toBe(true)
      expect(geminiVoices.some(v => v.id === 'gemini-pro-voice-2')).toBe(true)
    })

    it('should have OpenAI voices', () => {
      const openaiVoices = PREMIUM_VOICES.filter(v => v.provider === 'OPENAI')
      expect(openaiVoices.length).toBeGreaterThanOrEqual(2)
      expect(openaiVoices.some(v => v.id === 'alloy')).toBe(true)
      expect(openaiVoices.some(v => v.id === 'echo')).toBe(true)
    })

    it('should have ElevenLabs voices', () => {
      const elevenlabsVoices = PREMIUM_VOICES.filter(v => v.provider === 'ELEVENLABS')
      expect(elevenlabsVoices.length).toBeGreaterThanOrEqual(1)
      expect(elevenlabsVoices.some(v => v.id === 'rachel')).toBe(true)
    })

    it('should have Browser Free voice', () => {
      const browserVoices = PREMIUM_VOICES.filter(v => v.provider === 'BROWSER_FREE')
      expect(browserVoices.length).toBeGreaterThanOrEqual(1)
      expect(browserVoices.some(v => v.id === 'browser-1')).toBe(true)
    })

    it('should have all required voice properties', () => {
      for (const voice of PREMIUM_VOICES) {
        expect(voice).toHaveProperty('id')
        expect(voice).toHaveProperty('name')
        expect(voice).toHaveProperty('provider')
        expect(voice).toHaveProperty('tags')
        expect(voice).toHaveProperty('lang')
        expect(voice).toHaveProperty('gender')
        expect(typeof voice.id).toBe('string')
        expect(typeof voice.name).toBe('string')
        expect(typeof voice.provider).toBe('string')
        expect(Array.isArray(voice.tags)).toBe(true)
      }
    })
  })

  describe('Speech Synthesis', () => {
    const mockConfig: VoiceConfig = {
      voiceId: 'gemini-pro-voice-1',
      provider: 'GEMINI',
      stability: 0.75,
      clarity: 0.80,
      speed: 1.0,
      pitch: 1.0,
      emotion: 'neutral',
      ssmlEnabled: false,
      backgroundNoise: 'none',
      compression: 'mp3_320',
    }

    it('should synthesize speech with Gemini provider', async () => {
      const result = await CortexVoice.synthesize('Hola mundo', mockConfig)

      expect(result).toBeDefined()
      expect(result.audioBlob).toBeInstanceOf(Blob)
      expect(result.duration).toBe(30)
      expect(result.metadata).toBeDefined()
      expect(result.metadata.engine).toContain('Gemini')
      expect(result.metadata.metrics.latency).toBe(450)
    })

    it('should synthesize speech with OpenAI provider', async () => {
      const openaiConfig: VoiceConfig = {
        ...mockConfig,
        voiceId: 'alloy',
        provider: 'OPENAI',
      }

      const result = await CortexVoice.synthesize('Hello world', openaiConfig)

      expect(result).toBeDefined()
      expect(result.audioBlob).toBeInstanceOf(Blob)
      expect(result.metadata.engine).toContain('OpenAI')
      expect(result.metadata.metrics.latency).toBe(800)
    })

    it('should synthesize speech with ElevenLabs provider', async () => {
      const elevenlabsConfig: VoiceConfig = {
        ...mockConfig,
        voiceId: 'rachel',
        provider: 'ELEVENLABS',
      }

      const result = await CortexVoice.synthesize('Test speech', elevenlabsConfig)

      expect(result).toBeDefined()
      expect(result.audioBlob).toBeInstanceOf(Blob)
      expect(result.metadata.engine).toContain('ElevenLabs')
      expect(result.metadata.metrics.latency).toBe(1500)
    })

    it('should synthesize speech with Browser Free provider', async () => {
      const browserConfig: VoiceConfig = {
        ...mockConfig,
        voiceId: 'browser-1',
        provider: 'BROWSER_FREE',
      }

      const result = await CortexVoice.synthesize('Free speech', browserConfig)

      expect(result).toBeDefined()
      expect(result.audioBlob).toBeInstanceOf(Blob)
      expect(result.metadata.engine).toContain('WebSpeech')
      expect(result.metadata.metrics.latency).toBe(100)
      expect(result.metadata.metrics.cost).toBe(0)
    })

    it('should default to Browser Free for unknown provider', async () => {
      const unknownConfig: VoiceConfig = {
        ...mockConfig,
        provider: 'UNKNOWN' as unknown as VoiceConfig['provider'],
      }

      const result = await CortexVoice.synthesize('Test', unknownConfig)

      expect(result).toBeDefined()
      expect(result.metadata.engine).toContain('WebSpeech')
    })

    it('should include metadata in synthesis result', async () => {
      const result = await CortexVoice.synthesize('Test', mockConfig)

      expect(result.metadata).toHaveProperty('generatedAt')
      expect(result.metadata).toHaveProperty('engine')
      expect(result.metadata).toHaveProperty('metrics')
      expect(result.metadata).toHaveProperty('audioUrl')
      expect(result.metadata).toHaveProperty('settings')
      expect(result.metadata.generatedAt).toBeInstanceOf(Date)
      expect(result.metadata.metrics).toHaveProperty('latency')
      expect(result.metadata.metrics).toHaveProperty('cost')
    })

    it('should include audio URL in result', async () => {
      const result = await CortexVoice.synthesize('Test', mockConfig)

      expect(result.metadata.audioUrl).toBeDefined()
      expect(typeof result.metadata.audioUrl).toBe('string')
    })

    it('should include settings in result metadata', async () => {
      const result = await CortexVoice.synthesize('Test', mockConfig)

      expect(result.metadata.settings).toBeDefined()
      expect(result.metadata.settings?.voiceId).toBe(mockConfig.voiceId)
      expect(result.metadata.settings?.provider).toBe(mockConfig.provider)
    })
  })

  describe('Advanced Synthesis', () => {
    it('should synthesize with advanced options', async () => {
      const result = await CortexVoice.synthesizeAdvanced('Test text', {
        voice: 'gemini-pro-voice-1',
        emotionalTone: 'professional',
        stability: 0.8,
        clarity: 0.9,
      })

      expect(result).toBeDefined()
      expect(result.audioBlob).toBeInstanceOf(Blob)
      expect(result.metadata).toBeDefined()
    })

    it('should use default values for missing advanced options', async () => {
      const result = await CortexVoice.synthesizeAdvanced('Test text', {})

      expect(result).toBeDefined()
      expect(result.metadata.settings).toBeDefined()
    })

    it('should override provider based on voice ID', async () => {
      // Usar un voice ID de OpenAI pero sin especificar provider
      const result = await CortexVoice.synthesizeAdvanced('Test', {
        voice: 'alloy',
      })

      expect(result.metadata.engine).toContain('OpenAI')
    })

    it('should override provider for ElevenLabs voice', async () => {
      const result = await CortexVoice.synthesizeAdvanced('Test', {
        voice: 'rachel',
      })

      expect(result.metadata.engine).toContain('ElevenLabs')
    })

    it('should handle text parameter in options', async () => {
      const result = await CortexVoice.synthesizeAdvanced('', {
        text: 'Override text',
        voice: 'gemini-pro-voice-1',
      })

      expect(result).toBeDefined()
      expect(result.audioBlob).toBeInstanceOf(Blob)
    })
  })

  describe('Voice Configuration Types', () => {
    it('should accept all valid emotion types', () => {
      const emotions: Array<'neutral' | 'happy' | 'urgent' | 'dramatic' | 'corporate' | 'professional'> = [
        'neutral',
        'happy',
        'urgent',
        'dramatic',
        'corporate',
        'professional',
      ]

      for (const emotion of emotions) {
        const config: VoiceConfig = {
          voiceId: 'test',
          provider: 'GEMINI',
          stability: 0.5,
          clarity: 0.5,
          speed: 1.0,
          pitch: 1.0,
          emotion,
          ssmlEnabled: false,
          backgroundNoise: 'none',
          compression: 'mp3_320',
        }
        expect(config.emotion).toBe(emotion)
      }
    })

    it('should accept all valid provider types', () => {
      const providers: Array<VoiceConfig['provider']> = [
        'GEMINI',
        'OPENAI',
        'ELEVENLABS',
        'BROWSER_FREE',
      ]

      for (const provider of providers) {
        const config: VoiceConfig = {
          voiceId: 'test',
          provider,
          stability: 0.5,
          clarity: 0.5,
          speed: 1.0,
          pitch: 1.0,
          ssmlEnabled: false,
          backgroundNoise: 'none',
          compression: 'mp3_320',
        }
        expect(config.provider).toBe(provider)
      }
    })

    it('should accept all valid background noise types', () => {
      const noises: Array<VoiceConfig['backgroundNoise']> = [
        'none',
        'office',
        'street',
        'studio',
      ]

      for (const noise of noises) {
        const config: VoiceConfig = {
          voiceId: 'test',
          provider: 'GEMINI',
          stability: 0.5,
          clarity: 0.5,
          speed: 1.0,
          pitch: 1.0,
          ssmlEnabled: false,
          backgroundNoise: noise,
          compression: 'mp3_320',
        }
        expect(config.backgroundNoise).toBe(noise)
      }
    })

    it('should accept all valid compression types', () => {
      const compressions: Array<VoiceConfig['compression']> = [
        'mp3_320',
        'wav_48',
        'aac_192',
      ]

      for (const compression of compressions) {
        const config: VoiceConfig = {
          voiceId: 'test',
          provider: 'GEMINI',
          stability: 0.5,
          clarity: 0.5,
          speed: 1.0,
          pitch: 1.0,
          ssmlEnabled: false,
          backgroundNoise: 'none',
          compression,
        }
        expect(config.compression).toBe(compression)
      }
    })
  })

  describe('Synthesis Result Structure', () => {
    it('should return correct SynthesisResult structure', async () => {
      const config: VoiceConfig = {
        voiceId: 'gemini-pro-voice-1',
        provider: 'GEMINI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      }

      const result: SynthesisResult = await CortexVoice.synthesize('Test', config)

      expect(result).toHaveProperty('audioBlob')
      expect(result).toHaveProperty('duration')
      expect(result).toHaveProperty('metadata')
      expect(result.metadata).toHaveProperty('generatedAt')
      expect(result.metadata).toHaveProperty('engine')
      expect(result.metadata).toHaveProperty('metrics')
      expect(result.metadata.metrics).toHaveProperty('latency')
      expect(result.metadata.metrics).toHaveProperty('cost')
    })

    it('should return audio as Blob', async () => {
      const result = await CortexVoice.synthesize('Test', {
        voiceId: 'gemini-pro-voice-1',
        provider: 'GEMINI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      expect(result.audioBlob).toBeInstanceOf(Blob)
      expect(result.audioBlob.type).toBe('audio/wav')
    })

    it('should return positive duration', async () => {
      const result = await CortexVoice.synthesize('Test', {
        voiceId: 'gemini-pro-voice-1',
        provider: 'GEMINI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      expect(result.duration).toBeGreaterThan(0)
      expect(typeof result.duration).toBe('number')
    })
  })

  describe('Cost Calculation', () => {
    it('should have zero cost for Browser Free provider', async () => {
      const result = await CortexVoice.synthesize('Test', {
        voiceId: 'browser-1',
        provider: 'BROWSER_FREE',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      expect(result.metadata.metrics.cost).toBe(0)
    })

    it('should have cost for paid providers', async () => {
      const geminiResult = await CortexVoice.synthesize('Test', {
        voiceId: 'gemini-pro-voice-1',
        provider: 'GEMINI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      expect(geminiResult.metadata.metrics.cost).toBeGreaterThan(0)

      const openaiResult = await CortexVoice.synthesize('Test', {
        voiceId: 'alloy',
        provider: 'OPENAI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      expect(openaiResult.metadata.metrics.cost).toBeGreaterThan(0)
    })
  })

  describe('Latency Metrics', () => {
    it('should have different latency for different providers', async () => {
      const geminiResult = await CortexVoice.synthesize('Test', {
        voiceId: 'gemini-pro-voice-1',
        provider: 'GEMINI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      const openaiResult = await CortexVoice.synthesize('Test', {
        voiceId: 'alloy',
        provider: 'OPENAI',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      const elevenlabsResult = await CortexVoice.synthesize('Test', {
        voiceId: 'rachel',
        provider: 'ELEVENLABS',
        stability: 0.75,
        clarity: 0.80,
        speed: 1.0,
        pitch: 1.0,
        ssmlEnabled: false,
        backgroundNoise: 'none',
        compression: 'mp3_320',
      })

      expect(geminiResult.metadata.metrics.latency).toBe(450)
      expect(openaiResult.metadata.metrics.latency).toBe(800)
      expect(elevenlabsResult.metadata.metrics.latency).toBe(1500)
    })
  })
})
