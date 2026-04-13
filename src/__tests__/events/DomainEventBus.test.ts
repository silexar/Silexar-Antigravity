/**
 * Tests for DomainEventBus
 * src/lib/events/DomainEventBus.ts
 *
 * Redis is mocked — tests exercise in-memory dispatch and pub/sub logic only.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Redis client (BEFORE importing the bus) ──────────────────────────────

const mockXadd = vi.fn().mockResolvedValue('stream-entry-id')

vi.mock('@/lib/cache/redis-client', () => ({
  getRedisClient: () => ({
    xadd: mockXadd,
  }),
}))

// ── Mock logger ───────────────────────────────────────────────────────────────

vi.mock('@/lib/observability', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// ── Import after mocks ────────────────────────────────────────────────────────

import { domainEventBus, type DomainEventPayload, type ResolvedDomainEvent } from '@/lib/events/DomainEventBus'

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  domainEventBus.clear()
  vi.clearAllMocks()
})

// ── subscribe / unsubscribe ───────────────────────────────────────────────────

describe('subscribe', () => {
  it('registers a handler and calls it on publish', async () => {
    const handler = vi.fn()
    domainEventBus.subscribe('TestEvent', handler)

    await domainEventBus.publish({
      eventName: 'TestEvent',
      tenantId: 'tenant-001',
      data: { foo: 'bar' },
    })

    expect(handler).toHaveBeenCalledOnce()
  })

  it('returns an unsubscribe function', async () => {
    const handler = vi.fn()
    const unsubscribe = domainEventBus.subscribe('TestEvent', handler)

    unsubscribe()

    await domainEventBus.publish({ eventName: 'TestEvent', data: {} })
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not call handlers for different event names', async () => {
    const handler = vi.fn()
    domainEventBus.subscribe('EventA', handler)

    await domainEventBus.publish({ eventName: 'EventB', data: {} })
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls multiple handlers registered for the same event', async () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    domainEventBus.subscribe('MultiEvent', h1)
    domainEventBus.subscribe('MultiEvent', h2)

    await domainEventBus.publish({ eventName: 'MultiEvent', data: {} })
    expect(h1).toHaveBeenCalledOnce()
    expect(h2).toHaveBeenCalledOnce()
  })

  it('does not call unsubscribed handler but still calls remaining ones', async () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    const unsubscribe = domainEventBus.subscribe('MyEvent', h1)
    domainEventBus.subscribe('MyEvent', h2)

    unsubscribe()

    await domainEventBus.publish({ eventName: 'MyEvent', data: {} })
    expect(h1).not.toHaveBeenCalled()
    expect(h2).toHaveBeenCalledOnce()
  })
})

// ── publish ───────────────────────────────────────────────────────────────────

describe('publish', () => {
  it('passes a ResolvedDomainEvent to the handler', async () => {
    let received: ResolvedDomainEvent | undefined

    domainEventBus.subscribe('OrderCreated', (event) => {
      received = event
    })

    await domainEventBus.publish({
      eventName: 'OrderCreated',
      tenantId: 'tenant-001',
      aggregateId: 'order-123',
      data: { amount: 1000 },
    })

    expect(received).toBeDefined()
    expect(received!.eventName).toBe('OrderCreated')
    expect(received!.tenantId).toBe('tenant-001')
    expect(received!.aggregateId).toBe('order-123')
    expect(received!.data).toEqual({ amount: 1000 })
  })

  it('auto-generates eventId if not provided', async () => {
    let received: ResolvedDomainEvent | undefined
    domainEventBus.subscribe('AutoId', (e) => { received = e })

    await domainEventBus.publish({ eventName: 'AutoId', data: {} })

    expect(received!.eventId).toBeDefined()
    expect(received!.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('uses provided eventId when given', async () => {
    let received: ResolvedDomainEvent | undefined
    domainEventBus.subscribe('ExplicitId', (e) => { received = e })

    await domainEventBus.publish({
      eventName: 'ExplicitId',
      eventId: 'my-custom-id',
      data: {},
    })

    expect(received!.eventId).toBe('my-custom-id')
  })

  it('auto-sets occurredAt as ISO-8601 string', async () => {
    let received: ResolvedDomainEvent | undefined
    domainEventBus.subscribe('TimeCheck', (e) => { received = e })

    const before = new Date().toISOString()
    await domainEventBus.publish({ eventName: 'TimeCheck', data: {} })
    const after = new Date().toISOString()

    expect(received!.occurredAt >= before).toBe(true)
    expect(received!.occurredAt <= after).toBe(true)
  })

  it('defaults tenantId to empty string when omitted', async () => {
    let received: ResolvedDomainEvent | undefined
    domainEventBus.subscribe('NoTenant', (e) => { received = e })

    await domainEventBus.publish({ eventName: 'NoTenant', data: {} })
    expect(received!.tenantId).toBe('')
  })

  it('defaults aggregateId to empty string when omitted', async () => {
    let received: ResolvedDomainEvent | undefined
    domainEventBus.subscribe('NoAggregate', (e) => { received = e })

    await domainEventBus.publish({ eventName: 'NoAggregate', data: {} })
    expect(received!.aggregateId).toBe('')
  })

  it('persists event to Redis via xadd', async () => {
    await domainEventBus.publish({
      eventName: 'RedisEvent',
      tenantId: 'tenant-test',
      data: { key: 'value' },
    })

    expect(mockXadd).toHaveBeenCalledOnce()
    const args = mockXadd.mock.calls[0]
    expect(args[0]).toBe('domain:events')
    // MAXLEN args
    expect(args[1]).toBe('MAXLEN')
    expect(args[2]).toBe('~')
    // stream fields
    const fieldMap: Record<string, string> = {}
    for (let i = 4; i < args.length; i += 2) {
      fieldMap[args[i]] = args[i + 1]
    }
    expect(fieldMap.eventName).toBe('RedisEvent')
    expect(fieldMap.tenantId).toBe('tenant-test')
    expect(JSON.parse(fieldMap.data)).toEqual({ key: 'value' })
  })

  it('continues dispatching locally when Redis xadd fails', async () => {
    mockXadd.mockRejectedValueOnce(new Error('Redis down'))

    const handler = vi.fn()
    domainEventBus.subscribe('RedisFailEvent', handler)

    await domainEventBus.publish({ eventName: 'RedisFailEvent', data: { x: 1 } })

    // Handler still called despite Redis failure
    expect(handler).toHaveBeenCalledOnce()
  })
})

// ── publishAll ────────────────────────────────────────────────────────────────

describe('publishAll', () => {
  it('publishes all events in order', async () => {
    const received: string[] = []
    domainEventBus.subscribe('OrderEvent', (e) => {
      received.push(e.data.step as string)
    })

    await domainEventBus.publishAll([
      { eventName: 'OrderEvent', data: { step: 'first' } },
      { eventName: 'OrderEvent', data: { step: 'second' } },
      { eventName: 'OrderEvent', data: { step: 'third' } },
    ])

    expect(received).toEqual(['first', 'second', 'third'])
  })

  it('calls Redis xadd for each event', async () => {
    await domainEventBus.publishAll([
      { eventName: 'EventA', data: {} },
      { eventName: 'EventB', data: {} },
    ])

    expect(mockXadd).toHaveBeenCalledTimes(2)
  })
})

// ── clear ─────────────────────────────────────────────────────────────────────

describe('clear', () => {
  it('removes all handlers so subsequent publishes do nothing', async () => {
    const handler = vi.fn()
    domainEventBus.subscribe('ClearTest', handler)
    domainEventBus.clear()

    await domainEventBus.publish({ eventName: 'ClearTest', data: {} })
    expect(handler).not.toHaveBeenCalled()
  })
})

// ── handler error isolation ───────────────────────────────────────────────────

describe('handler error isolation', () => {
  it('continues calling subsequent handlers when one throws', async () => {
    const failingHandler = vi.fn().mockRejectedValue(new Error('handler crashed'))
    const successHandler = vi.fn()

    domainEventBus.subscribe('ErrorEvent', failingHandler)
    domainEventBus.subscribe('ErrorEvent', successHandler)

    // Should NOT throw
    await expect(
      domainEventBus.publish({ eventName: 'ErrorEvent', data: {} })
    ).resolves.not.toThrow()

    expect(failingHandler).toHaveBeenCalled()
    expect(successHandler).toHaveBeenCalled()
  })
})
