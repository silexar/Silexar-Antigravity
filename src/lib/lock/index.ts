/**
 * SILEXAR PULSE - Lock Module
 * 
 * @description Barrel export for all lock components
 */

export {
    distributedLock,
    lock,
    withLock,
    LockError,
    type Lock,
    type LockOptions,
    type LockResult,
} from './DistributedLock';