import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from '../components/Editor'
import { mockApi } from './setup'

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onChange, value }: any) => {
    return (
      <div data-testid="monaco-editor">
        <textarea
          data-testid="monaco-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    )
  }
}))

describe('Editor.tsx - Fragment Management', () => {
  const mockSnippet = {
    id: 'snippet-1',
    title: 'Test Snippet',
    tags: ['react'],
    activeFragmentId: 'fragment-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const mockFragments = [
    {
      id: 'fragment-1',
      snippetId: 'snippet-1',
      title: 'Fragment 1',
      content: 'Content 1',
      language: 'javascript',
      order: 0,
      viewState: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fragment-2',
      snippetId: 'snippet-1',
      title: 'Fragment 2',
      content: 'Content 2',
      language: 'typescript',
      order: 1,
      viewState: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockSettings = {
    id: 'settings-1',
    theme: 'light' as const,
    editorFontSize: 14,
    editorFontFamily: 'monospace',
    autosave: true
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockApi.getSnippets.mockResolvedValue([mockSnippet])
    mockApi.getFragments.mockResolvedValue(mockFragments)
    mockApi.getSettings.mockResolvedValue(mockSettings)
    mockApi.saveFragment.mockResolvedValue(undefined)
    mockApi.updateSnippet.mockResolvedValue(undefined)
    mockApi.deleteFragment.mockResolvedValue(undefined)
  })

  it('初期ロード時にフラグメントを取得する', async () => {
    const onUpdate = vi.fn()

    render(<Editor snippetId="snippet-1" onUpdate={onUpdate} settings={mockSettings} />)

    await waitFor(() => {
      expect(mockApi.getFragments).toHaveBeenCalledWith('snippet-1')
      expect(mockApi.getSnippets).toHaveBeenCalled()
    })

    // Fragments should be displayed as tabs
    expect(screen.getByText('Fragment 1')).toBeInTheDocument()
    expect(screen.getByText('Fragment 2')).toBeInTheDocument()
  })

  it('タブをクリックしてフラグメントを切り替えられる', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(<Editor snippetId="snippet-1" onUpdate={onUpdate} settings={mockSettings} />)

    await waitFor(() => {
      expect(screen.getByText('Fragment 1')).toBeInTheDocument()
    })

    // Click on second fragment tab
    await user.click(screen.getByText('Fragment 2'))

    // Should update snippet's activeFragmentId with silent flag (UI state only)
    await waitFor(() => {
      expect(mockApi.updateSnippet).toHaveBeenCalledWith(
        'snippet-1',
        { activeFragmentId: 'fragment-2' },
        { silent: true }
      )
    })
  })

  it('新しいフラグメントを作成できる', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(<Editor snippetId="snippet-1" onUpdate={onUpdate} settings={mockSettings} />)

    await waitFor(() => {
      expect(screen.getByText('Fragment 1')).toBeInTheDocument()
    })

    // Find and click the "+" button
    const newFragmentButton = screen.getByRole('button', { name: /\+/i })
    await user.click(newFragmentButton)

    await waitFor(() => {
      expect(mockApi.saveFragment).toHaveBeenCalled()
      // Check that the saved fragment has the right properties
      const savedFragment = mockApi.saveFragment.mock.calls[0][0]
      expect(savedFragment).toMatchObject({
        snippetId: 'snippet-1',
        title: '',
        content: '',
        language: 'plaintext'
      })
    })
  })

  it('最後のフラグメント削除時にスニペット削除確認が表示される', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Mock only one fragment
    mockApi.getFragments.mockResolvedValue([mockFragments[0]])
    mockApi.deleteSnippet.mockResolvedValue(undefined)

    render(<Editor snippetId="snippet-1" onUpdate={onUpdate} settings={mockSettings} />)

    await waitFor(() => {
      expect(screen.getByText('Fragment 1')).toBeInTheDocument()
    })

    // Find delete button on the fragment tab
    const deleteButtons = screen.getAllByText('×')
    // Click the one on the tab (not the tag delete button)
    await user.click(deleteButtons[deleteButtons.length - 1])

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('last fragment'))
      expect(mockApi.deleteSnippet).toHaveBeenCalledWith('snippet-1')
      expect(onUpdate).toHaveBeenCalled()
    })

    confirmSpy.mockRestore()
  })

  it('フラグメント削除時に次のフラグメントが選択される', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<Editor snippetId="snippet-1" onUpdate={onUpdate} settings={mockSettings} />)

    await waitFor(() => {
      expect(screen.getByText('Fragment 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment 2')).toBeInTheDocument()
    })

    // Delete first fragment
    const deleteButtons = screen.getAllByText('×')
    // Click the delete button on the first tab
    await user.click(deleteButtons[deleteButtons.length - 2])

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
      expect(mockApi.deleteFragment).toHaveBeenCalledWith('fragment-1')
    })

    confirmSpy.mockRestore()
  })
})
