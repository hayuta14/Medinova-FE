/**
 * Simple toast notification utility using Bootstrap toast
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number; // milliseconds
}

let toastContainer: HTMLDivElement | null = null;

function getOrCreateToastContainer(): HTMLDivElement {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function createToast(message: string, type: ToastType, options?: ToastOptions): void {
  const container = getOrCreateToastContainer();
  const toastId = `toast-${Date.now()}-${Math.random()}`;
  
  const bgClass = {
    success: 'bg-success',
    error: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
  }[type];

  const toastHtml = `
    <div id="${toastId}" class="toast ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true" style="min-width: 300px;">
      <div class="toast-header ${bgClass} text-white border-0">
        <strong class="me-auto">
          ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'} 
          ${type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : type === 'warning' ? 'Cảnh báo' : 'Thông tin'}
        </strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = toastHtml;
  const toastElement = tempDiv.firstElementChild as HTMLElement;
  container.appendChild(toastElement);

  // Initialize Bootstrap toast
  const bsToast = new (window as any).bootstrap.Toast(toastElement, {
    autohide: true,
    delay: options?.duration || 5000,
  });

  bsToast.show();

  // Remove element after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    createToast(message, 'success', options);
  },
  error: (message: string, options?: ToastOptions) => {
    createToast(message, 'error', options);
  },
  warning: (message: string, options?: ToastOptions) => {
    createToast(message, 'warning', options);
  },
  info: (message: string, options?: ToastOptions) => {
    createToast(message, 'info', options);
  },
};

