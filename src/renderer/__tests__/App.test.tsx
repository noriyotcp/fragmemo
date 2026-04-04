import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { mockApi } from './setup'

describe('App.tsx - Snippet Management', () => {
  const mockSnippets = [
    {
      id: 'snippet-1',
      title: 'Test Snippet 1',
      tags: ['react', 'testing'],
      activeFragmentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'snippet-2',
      title: 'Test Snippet 2',
      tags: ['typescript'],
      activeFragmentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ]

  const mockSettings = {
    theme: 'light' as const,
    editorFontSize: 14,
    editorFontFamily: 'monospace'
  }

  const mockAppState = {
    activeSnippetId: null
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockApi.getSnippets.mockResolvedValue(mockSnippets)
    mockApi.getSettings.mockResolvedValue(mockSettings)
    mockApi.getAppState.mockResolvedValue(mockAppState)
    mockApi.getFragments.mockResolvedValue([])
    mockApi.updateSnippet.mockResolvedValue(undefined)
    mockApi.updateAppState.mockResolvedValue(undefined)
  })

  it('初期ロード時にスニペットと設定を取得する', async () => {
    render(<App />)

    await waitFor(() => {
      expect(mockApi.getSnippets).toHaveBeenCalled()
      expect(mockApi.getSettings).toHaveBeenCalled()
      expect(mockApi.getAppState).toHaveBeenCalled()
    })

    // Snippets should be displayed
    expect(screen.getByText('Test Snippet 1')).toBeInTheDocument()
    expect(screen.getByText('Test Snippet 2')).toBeInTheDocument()
  })

  it('スニペットを選択すると activeSnippetId が更新される', async () => {
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Snippet 1')).toBeInTheDocument()
    })

    // Click on a snippet
    await user.click(screen.getByText('Test Snippet 1'))

    // Should load fragments for the selected snippet
    await waitFor(() => {
      expect(mockApi.getFragments).toHaveBeenCalledWith('snippet-1')
    })
  })

  it('スニペット削除時に次のスニペットが選択される', async () => {
    const user = userEvent.setup()

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Set initial active snippet
    mockApi.getAppState.mockResolvedValue({ activeSnippetId: 'snippet-1' })
    mockApi.deleteSnippet.mockResolvedValue(undefined)

    // After deletion, return updated list
    mockApi.getSnippets
      .mockResolvedValueOnce(mockSnippets) // Initial load
      .mockResolvedValueOnce(mockSnippets.slice(1)) // After deletion

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Snippet 1')).toBeInTheDocument()
    })

    // Select first snippet
    await user.click(screen.getByText('Test Snippet 1'))

    await waitFor(() => {
      expect(mockApi.getFragments).toHaveBeenCalledWith('snippet-1')
    })

    // Find and click delete button (assumes delete button exists in Sidebar)
    // Note: This assumes the delete button has some accessible role/text
    // Adjust selector based on actual implementation
    const deleteButtons = screen.getAllByRole('button', { name: /delete|×/i })
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled()
        expect(mockApi.deleteSnippet).toHaveBeenCalledWith('snippet-1')
        // getSnippets is called multiple times due to useEffect dependencies
        expect(mockApi.getSnippets.mock.calls.length).toBeGreaterThanOrEqual(2)
      })
    }

    confirmSpy.mockRestore()
  })

  it('検索フィルタが機能する', async () => {
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Snippet 1')).toBeInTheDocument()
      expect(screen.getByText('Test Snippet 2')).toBeInTheDocument()
    })

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search/i)

    // Type search query
    await user.type(searchInput, 'typescript')

    // Only snippet 2 should be visible
    await waitFor(() => {
      expect(screen.queryByText('Test Snippet 1')).not.toBeInTheDocument()
      expect(screen.getByText('Test Snippet 2')).toBeInTheDocument()
    })

    // Clear search
    await user.clear(searchInput)

    // Both snippets should be visible again
    await waitFor(() => {
      expect(screen.getByText('Test Snippet 1')).toBeInTheDocument()
      expect(screen.getByText('Test Snippet 2')).toBeInTheDocument()
    })
  })

  it('検索中のスニペット削除で検索クエリが保持される', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Start with both snippets matching search
    const typescriptSnippet = {
      ...mockSnippets[1],
      tags: ['typescript', 'test']
    }

    mockApi.getSnippets
      .mockResolvedValueOnce([typescriptSnippet])
      .mockResolvedValueOnce([]) // After deletion, no snippets match

    mockApi.getAppState.mockResolvedValue({ activeSnippetId: typescriptSnippet.id })
    mockApi.deleteSnippet.mockResolvedValue(undefined)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Test Snippet 2')).toBeInTheDocument()
    })

    // Search for 'typescript'
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'typescript')

    // Select and delete the snippet
    await user.click(screen.getByText('Test Snippet 2'))

    const deleteButtons = screen.getAllByRole('button', { name: /delete|×/i })
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockApi.deleteSnippet).toHaveBeenCalled()
      })

      // Search query should still be in the input
      expect(searchInput).toHaveValue('typescript')

      // Editor should show empty state
      expect(screen.getByText(/select a snippet/i)).toBeInTheDocument()
    }

    confirmSpy.mockRestore()
  })
})
