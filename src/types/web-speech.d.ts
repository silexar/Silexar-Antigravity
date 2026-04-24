/**
 * Type declarations for Web Speech API
 */

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
}

interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
    error: SpeechRecognitionErrorCode
    message: string
}

type SpeechRecognitionErrorCode =
    | 'aborted'
    | 'audio-capture'
    | 'bad-grammar'
    | 'language-not-supported'
    | 'network'
    | 'no-speech'
    | 'not-allowed'
    | 'service-not-allowed'

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null
    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
    onend: ((this: SpeechRecognition, ev: Event) => void) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
    onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null
    onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
    onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null
    onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null
    abort(): void
    start(): void
    stop(): void
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition
    prototype: SpeechRecognition
}

interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
}
