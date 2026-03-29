/**
 * Playwright Global Teardown
 *
 * Runs once after all E2E tests complete.
 * Cleans up temporary auth state files created during setup.
 */

import path from 'path'
import fs from 'fs'

async function globalTeardown() {
  // Remove auth state file — contains session tokens, should not persist
  const authStatePath = path.join(process.cwd(), 'test-results', 'auth-state.json')
  if (fs.existsSync(authStatePath)) {
    fs.rmSync(authStatePath)
    console.log('[teardown] Auth state file removed')
  }

  console.log('[teardown] Global teardown complete')
}

export default globalTeardown
