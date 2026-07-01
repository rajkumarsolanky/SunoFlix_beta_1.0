/* ============================================
   SunoFlix - Toast Notification Component
   Load this FIRST on every page (before script.js)
   Exposes: window.showToast(message, type, duration)
   ============================================ */

function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    return container;
}

const TOAST_ICONS = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
};

function showToast(message, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = document.createElement('i');
    icon.className = `fas ${TOAST_ICONS[type] || TOAST_ICONS.info}`;
    icon.setAttribute('aria-hidden', 'true');

    const msg = document.createElement('span');
    msg.className = 'toast-message';
    msg.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';

    toast.append(icon, msg, closeBtn);

    const remove = () => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', remove);
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(remove, duration);
    }

    return toast;
}

window.showToast = showToast;
