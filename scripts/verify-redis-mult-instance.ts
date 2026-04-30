/**
 * Silexar Pulse - Redis Multi-Instance Verification Script
 * 
 * Verifies Redis configuration for production multi-instance deployments
 * Identifies single points of failure and configuration issues
 * 
 * Usage: npx ts-node scripts/verify-redis-mult-instance.ts
 */

import Redis from 'ioredis';

interface RedisInstance {
    name: string;
    url: string;
    role: 'primary' | 'replica' | 'single';
    connected: boolean;
    latency?: number;
    memory?: number;
    opsPerSec?: number;
    errors: string[];
}

interface VerificationResult {
    timestamp: string;
    overall: 'PASS' | 'WARNING' | 'FAIL';
    instances: RedisInstance[];
    issues: string[];
    recommendations: string[];
}

const REDIS_INSTANCES = [
    {
        name: 'cache-primary',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        role: 'primary' as const,
    },
    {
        name: 'cache-replica-1',
        url: process.env.REDIS_REPLICA_URL_1 || 'redis://localhost:6380',
        role: 'replica' as const,
    },
    {
        name: 'session-primary',
        url: process.env.REDIS_SESSION_URL || 'redis://localhost:6379/1',
        role: 'primary' as const,
    },
    {
        name: 'rate-limit',
        url: process.env.REDIS_RATE_LIMIT_URL || 'redis://localhost:6379/2',
        role: 'single' as const,
    },
];

async function measureLatency(client: Redis): Promise<number> {
    const start = Date.now();
    await client.ping();
    return Date.now() - start;
}

async function getRedisInfo(client: Redis): Promise<Record<string, string>> {
    const info = await client.info('memory');
    const lines = info.split('\r\n');
    const result: Record<string, string> = {};

    for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            result[key.trim()] = valueParts.join(':').trim();
        }
    }

    return result;
}

async function connectToInstance(config: { name: string; url: string; role: string }): Promise<RedisInstance> {
    const instance: RedisInstance = {
        name: config.name,
        url: config.url,
        role: config.role as 'primary' | 'replica' | 'single',
        connected: false,
        errors: [],
    };

    try {
        const client = new Redis(config.url, {
            maxRetriesPerRequest: 3,
            connectTimeout: 5000,
            lazyConnect: true,
        });

        await client.connect();

        instance.connected = true;
        instance.latency = await measureLatency(client);

        const info = await getRedisInfo(client);
        instance.memory = info.used_memory_human ? parseInt(info.used_memory_human) : undefined;

        const commands = await client.info('stats');
        const opsMatch = commands.match(/instantaneous_ops_per_sec:(\d+)/);
        instance.opsPerSec = opsMatch ? parseInt(opsMatch[1]) : undefined;

        await client.quit();
    } catch (error) {
        instance.errors.push(error instanceof Error ? error.message : String(error));
    }

    return instance;
}

async function verifyClusterConfiguration(instances: RedisInstance[]): Promise<string[]> {
    const issues: string[] = [];

    const primaries = instances.filter(i => i.role === 'primary' && i.connected);
    const replicas = instances.filter(i => i.role === 'replica' && i.connected);

    // Check for single point of failure
    if (primaries.length === 0 && instances.some(i => i.role === 'single')) {
        issues.push('⚠️ Single Redis instance configured - no high availability');
    }

    if (primaries.length > 0 && replicas.length === 0) {
        issues.push('⚠️ Primary Redis instances have no replicas configured');
    }

    // Check for replica lag
    for (const replica of replicas) {
        if (replica.latency && replica.latency > 100) {
            issues.push(`⚠️ Replica ${replica.name} has high latency: ${replica.latency}ms`);
        }
    }

    return issues;
}

async function generateRecommendations(instances: RedisInstance[], issues: string[]): Promise<string[]> {
    const recommendations: string[] = [];

    const connectedCount = instances.filter(i => i.connected).length;
    const totalCount = instances.length;

    if (connectedCount < totalCount) {
        recommendations.push(`🔴 Connect ${totalCount - connectedCount} additional Redis instances for full HA`);
    }

    if (!instances.some(i => i.role === 'replica' && i.connected)) {
        recommendations.push('🔴 Configure at least one replica for read scaling and failover');
    }

    if (instances.some(i => i.latency && i.latency > 50)) {
        recommendations.push('🟡 Consider using Redis Cluster for geographically distributed caching');
    }

    if (!issues.includes('No TLS configured')) {
        recommendations.push('🟡 Enable TLS for Redis connections in production');
    }

    if (instances.some(i => i.errors.length > 0)) {
        recommendations.push('🔴 Resolve Redis connection errors before production deployment');
    }

    // Specific recommendations based on current implementation
    recommendations.push('');
    recommendations.push('📋 Implementation Notes:');
    recommendations.push('   - Rate limiting uses in-memory fallback when Redis unavailable');
    recommendations.push('   - Session blacklist uses Redis with in-memory fallback');
    recommendations.push('   - Domain events persist to Redis Streams with in-memory fallback');
    recommendations.push('');
    recommendations.push('✅ Production Recommendations:');
    recommendations.push('   1. Use Redis Sentinel or Redis Cluster for automatic failover');
    recommendations.push('   2. Configure replica reads for cache-heavy operations');
    recommendations.push('   3. Set up Redis monitoring with Prometheus metrics');
    recommendations.push('   4. Implement connection pooling for high traffic');

    return recommendations;
}

async function verifyRedisConfiguration(): Promise<VerificationResult> {
    console.log('🔍 Starting Redis Multi-Instance Verification...\n');

    const instances: RedisInstance[] = [];

    // Connect to all configured instances
    for (const config of REDIS_INSTANCES) {
        console.log(`   Checking ${config.name} (${config.url})...`);
        const instance = await connectToInstance(config);
        instances.push(instance);

        if (instance.connected) {
            console.log(`   ✅ ${config.name}: Connected (${instance.latency}ms latency)`);
        } else {
            console.log(`   ❌ ${config.name}: Failed - ${instance.errors.join(', ')}`);
        }
    }

    // Verify cluster configuration
    const issues = await verifyClusterConfiguration(instances);

    // Generate recommendations
    const recommendations = await generateRecommendations(instances, issues);

    // Determine overall status
    let overall: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    if (instances.some(i => i.errors.length > 0)) {
        overall = 'FAIL';
    } else if (issues.length > 0) {
        overall = 'WARNING';
    }

    const result: VerificationResult = {
        timestamp: new Date().toISOString(),
        overall,
        instances,
        issues,
        recommendations,
    };

    return result;
}

function printResult(result: VerificationResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REDIS MULTI-INSTANCE VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log(`\n🕐 Timestamp: ${result.timestamp}`);
    console.log(`📈 Overall Status: ${result.overall === 'PASS' ? '✅ PASS' : result.overall === 'WARNING' ? '⚠️ WARNING' : '❌ FAIL'}`);

    console.log('\n📍 Instance Status:');
    for (const instance of result.instances) {
        const status = instance.connected ? '✅' : '❌';
        const latency = instance.latency ? `(${instance.latency}ms)` : '';
        console.log(`   ${status} ${instance.name} [${instance.role}] ${latency}`);
        if (instance.errors.length > 0) {
            console.log(`      Errors: ${instance.errors.join(', ')}`);
        }
    }

    if (result.issues.length > 0) {
        console.log('\n⚠️ Issues Found:');
        for (const issue of result.issues) {
            console.log(`   ${issue}`);
        }
    }

    if (result.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        for (const rec of result.recommendations) {
            console.log(`   ${rec}`);
        }
    }

    console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
    try {
        const result = await verifyRedisConfiguration();
        printResult(result);

        // Exit with appropriate code
        process.exit(result.overall === 'FAIL' ? 1 : 0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

main();