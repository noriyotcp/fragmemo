type dispatchType = {
  type: string;
  detail?: object;
};

const dispatch = ({ type, detail }: dispatchType): void => {
  const event = new CustomEvent(type, { detail });

  window.dispatchEvent(event);
};

export const activeFragment = (fragmentId: number): void => {
  dispatch({
    type: "active-fragment",
    detail: {
      activeFragmentId: fragmentId,
    },
  });
};

export const displayToast = (message: string, options?: object): void => {
  dispatch({
    type: "display-toast-stack",
    detail: {
      message,
      ...options,
    },
  });
};

export const selectSnippet = (
  selectedSnippet: string,
  previouslySelectedSnippet: string
): void => {
  dispatch({
    type: "select-snippet",
    detail: {
      selectedSnippet,
      previouslySelectedSnippet,
    },
  });
};

// these params for view states
/**
 * @param {number} to - fragmentId to switch to
 * @param {number} [from] - fragmentId to switch from
 * @param {number} [snippetId] - snippetId to switch to
 * @return {void}
 */
export const snippetSelected = (
  to: number,
  from?: number,
  snippetId?: number
): void => {
  dispatch({
    type: "snippet-selected",
    detail: {
      to,
      from,
      snippetId,
    },
  });
};

export const fragmentSwitched = (from: number, to: number): void => {
  dispatch({
    type: "fragment-switched",
    detail: {
      from,
      to,
    },
  });
};

export const clearInternalSearchQuery = (): void => {
  dispatch({
    type: "clear-internal-search-query",
  });
};

export const snippetsCreated = (): void => {
  dispatch({
    type: "snippets-created",
  });
};

export const snippetsLoaded = (noSnippets: boolean): void => {
  dispatch({
    type: "snippets-loaded",
    detail: {
      noSnippets,
    },
  });
};
