import * as React from 'react';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Action creators
const addToRemoveQueue = (toastId) => ({
  type: 'ADD_TO_REMOVE_QUEUE',
  toastId,
});

// State management
const toastTimeouts = new Map();

const addToRemoveQueueOrDismiss = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Initial state
const initialState = {
  toasts: [],
};

// Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST':
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueueOrDismiss(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueueOrDismiss(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// Context
const ToastContext = React.createContext(undefined);

// Custom hook
function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Provider component
function ToastProvider({ children }) {
  const [state, dispatch] = React.useReducer(toastReducer, initialState);

  // Clean up timeouts on unmount
  React.useEffect(() => {
    return () => {
      toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      ...state,
      toast: (props) => {
        const id = genId();
        const update = (props) =>
          dispatch({
            type: 'UPDATE_TOAST',
            toast: { ...props, id },
          });
        const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

        dispatch({
          type: 'ADD_TOAST',
          toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
              if (!open) dismiss();
            },
          },
        });

        return {
          id,
          dismiss,
          update: (props) =>
            dispatch({
              type: 'UPDATE_TOAST',
              toast: { ...props, id },
            }),
        };
      },
      dismiss: (toastId) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    }),
    [state, dispatch]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export { ToastProvider, useToast };