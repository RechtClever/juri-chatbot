const JuriLogo = {
    render: function(containerIdOrEl, size = 'medium') {
        const sizePx = size === 'small' ? 60 : size === 'large' ? 160 : 100;
        let container = containerIdOrEl;
        if (typeof container === 'string') container = document.getElementById(container);
        if (!container) return;
        container.innerHTML = `
            <svg width="${sizePx}" height="${sizePx}" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                <circle cx="75" cy="75" r="70" fill="#F93D25"/>
                <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="46" font-weight="700" font-family="Segoe UI, Arial">J</text>
            </svg>
        `;
    },
    renderAvatar: function(containerIdOrEl, size = 40) {
        let container = containerIdOrEl;
        if (typeof container === 'string') container = document.getElementById(container);
        if (!container) return;
        container.innerHTML = `
            <svg width="${size}" height="${size}" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                <circle cx="75" cy="75" r="75" fill="#F93D25"/>
                <circle cx="56" cy="56" r="7" fill="#000"/>
                <circle cx="106" cy="56" r="7" fill="#000"/>
                <circle cx="56" cy="50" r="2" fill="#FFF"/>
                <circle cx="106" cy="50" r="2" fill="#FFF"/>
                <path d="M75 93c8.6 0 15.6-7 15.6-15.6H59.4C59.4 86 66.4 93 75 93z" fill="#FFF"/>
            </svg>
        `;
    }
};

window.JuriLogo = JuriLogo;


