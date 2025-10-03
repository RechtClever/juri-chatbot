const RechtCleverLogo = {
    render: function(containerIdOrEl, size = 'medium') {
        const sizePx = size === 'small' ? 80 : size === 'large' ? 180 : 120;
        let container = containerIdOrEl;
        if (typeof container === 'string') container = document.getElementById(container);
        if (!container) return;
        container.innerHTML = `
            <svg width="${sizePx}" height="${sizePx/3}" viewBox="0 0 300 90" xmlns="http://www.w3.org/2000/svg">
                <rect rx="10" width="300" height="90" fill="#151821" />
                <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#e6e6e9" font-size="28" font-family="Segoe UI, Arial">Recht Clever</text>
            </svg>
        `;
    }
};

window.RechtCleverLogo = RechtCleverLogo;


