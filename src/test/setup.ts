import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// jsdom's requestAnimationFrame schedules callbacks asynchronously via setTimeout,
// so animated components never reach their final state in synchronous test renders.
// Advance a shared timestamp by 1300ms per frame so animations that check elapsed time
// (duration ≤ 1200ms) complete within two frames, both fired synchronously.
let _rafTs = 0
global.requestAnimationFrame = (cb) => { _rafTs += 1300; cb(_rafTs); return 0 }
global.cancelAnimationFrame = () => {}

afterEach(() => {
  cleanup()
})
