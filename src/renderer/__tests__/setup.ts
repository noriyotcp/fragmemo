import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock window.api (Electron IPC)
const mockApi = {
  // Snippets
  getSnippets: vi.fn(),
  createSnippet: vi.fn(),
  updateSnippet: vi.fn(),
  deleteSnippet: vi.fn(),

  // Fragments
  getFragments: vi.fn(),
  saveFragment: vi.fn(),
  deleteFragment: vi.fn(),
  updateFragmentState: vi.fn(),

  // Settings
  getSettings: vi.fn(),
  updateSettings: vi.fn(),

  // App State
  getAppState: vi.fn(),
  updateAppState: vi.fn(),

  // Menu event listeners
  onMenuNewSnippet: vi.fn(() => () => {}), // Returns unsubscribe function
  onMenuOpenSettings: vi.fn(() => () => {}),
  onMenuCloseTab: vi.fn(() => () => {}),
}

// Define window.api on global
Object.defineProperty(window, 'api', {
  writable: true,
  value: mockApi
})

// Mock matchMedia for theme testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Export mock API for test access
export { mockApi }
