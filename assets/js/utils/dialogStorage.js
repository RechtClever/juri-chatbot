const DialogStorage = {
    KEY: 'juri-dialog-structure',
    ZIP_KEY: 'juri-dialog-zip-base64',
    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
    },
    save(structure) {
        try { localStorage.setItem(this.KEY, JSON.stringify(structure)); } catch (_) {}
    },
    loadZip() {
        try { return localStorage.getItem(this.ZIP_KEY); } catch (_) { return null; }
    },
    saveZip(base64) {
        try { localStorage.setItem(this.ZIP_KEY, base64); } catch (_) {}
    }
};

window.DialogStorage = DialogStorage;


