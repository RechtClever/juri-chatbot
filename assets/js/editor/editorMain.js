class EditorMain {
    constructor() {
        this.currentFile = null;
        this.structure = this.loadStructure() || this.createEmptyStructure();
        this.selectedItem = null;
        this.treeEditor = null;
        this.contentEditor = null;

        this.init();
    }

    init() {
        try {
            if (typeof RechtCleverLogo !== 'undefined' && typeof RechtCleverLogo.render === 'function') {
                RechtCleverLogo.render('logoContainer', 'small');
            }
        } catch (_) {}

        if (typeof TreeEditor !== 'undefined') {
            this.treeEditor = new TreeEditor(this.structure, this);
        }
        if (typeof ContentEditor !== 'undefined') {
            this.contentEditor = new ContentEditor(this);
        }

        this.attachEventListeners();

        if (this.treeEditor && typeof this.treeEditor.render === 'function') {
            this.treeEditor.render();
        }
        // Root als Startauswahl
        this.selectItem(this.structure);
        this.updateStats();
        this.saveStructure();
        this.initTabs();
    }

    // Datei-/Ordner-Operationen
    newFile() {
        const parent = this.selectedItem && this.selectedItem.type === 'folder' ? this.selectedItem : this.structure;
        const fileName = 'neue-datei.txt';
        const newFile = {
            name: fileName,
            type: 'file',
            content: '# Neue Frage\nBeschreibung der Frage\n\n-----\n\n$variableName$\n\n/text',
            path: this.generatePath(parent, fileName)
        };

        if (!parent.children) parent.children = [];
        parent.children.push(newFile);

        if (this.treeEditor) this.treeEditor.render();
        this.selectItem(newFile);
        this.updateStats();
        this.saveStructure();
    }

    newFolder() {
        const parent = this.selectedItem && this.selectedItem.type === 'folder' ? this.selectedItem : this.structure;
        const folderName = 'Neuer Ordner';
        const folder = {
            name: folderName,
            type: 'folder',
            children: [],
            path: this.generatePath(parent, folderName)
        };

        if (!parent.children) parent.children = [];
        parent.children.push(folder);

        if (this.treeEditor) this.treeEditor.render();
        this.selectItem(folder);
        this.updateStats();
        this.saveStructure();
    }

    generatePath(parent, name) {
        if (!parent || !parent.path) return name;
        return `${parent.path}/${name}`;
    }

    selectItem(item) {
        this.selectedItem = item;
        if (this.contentEditor && typeof this.contentEditor.loadItem === 'function') {
            this.contentEditor.loadItem(item);
        }
        this.updatePropertiesUI(item);
        this.updateBreadcrumb(item);
        this.setCurrentFile(item);
    }

    // UI-Property Felder befüllen
    updatePropertiesUI(item) {
        if (!item) return;
        const nameEl = document.getElementById('propName');
        const typeEl = document.getElementById('propType');
        const pathEl = document.getElementById('propPath');
        if (nameEl) nameEl.value = item.name || '';
        if (typeEl) typeEl.value = item.type || 'file';
        if (pathEl) pathEl.value = item.path || '';
    }

    // Änderungen aus Property-Panel übernehmen
    applyPropertyChanges() {
        if (!this.selectedItem) return;

        const nameEl = document.getElementById('propName');
        const typeEl = document.getElementById('propType');
        const newName = nameEl ? nameEl.value : this.selectedItem.name;
        const newType = typeEl ? typeEl.value : this.selectedItem.type;

        if (newName !== this.selectedItem.name) {
            this.selectedItem.name = newName;
            this.selectedItem.path = this.updateItemPath(this.selectedItem, newName);
        }
        if (newType !== this.selectedItem.type) {
            this.selectedItem.type = newType;
            if (newType === 'folder' && !this.selectedItem.children) {
                this.selectedItem.children = [];
            }
        }

        if (this.treeEditor) this.treeEditor.render();
        this.updateStats();
        this.saveStructure();
    }

    updateItemPath(item, newName) {
        if (!item.path) return newName;
        const parts = item.path.split('/');
        parts[parts.length - 1] = newName;
        return parts.join('/');
    }

    deleteSelected() {
        if (!this.selectedItem || this.selectedItem === this.structure) return;
        if (!confirm(`Möchten Sie "${this.selectedItem.name}" wirklich löschen?`)) return;

        this.removeItemFromStructure(this.selectedItem);
        this.selectedItem = null;
        if (this.contentEditor && typeof this.contentEditor.clear === 'function') {
            this.contentEditor.clear();
        }
        if (this.treeEditor) this.treeEditor.render();
        this.updateStats();
        this.saveStructure();
    }

    removeItemFromStructure(itemToRemove) {
        const removeFromChildren = (children) => {
            if (!children) return false;
            const index = children.indexOf(itemToRemove);
            if (index > -1) {
                children.splice(index, 1);
                return true;
            }
            return children.some(child => child.children && removeFromChildren(child.children));
        };
        removeFromChildren(this.structure.children);
    }

    duplicate() {
        if (!this.selectedItem) return;
        const duplicate = JSON.parse(JSON.stringify(this.selectedItem));
        duplicate.name = `${duplicate.name} - Kopie`;
        const parent = this.getParentOf(this.selectedItem) || this.structure;
        duplicate.path = this.generatePath(parent, duplicate.name);
        if (!parent.children) parent.children = [];
        parent.children.push(duplicate);
        if (this.treeEditor) this.treeEditor.render();
        this.updateStats();
        this.saveStructure();
    }

    getParentOf(targetItem) {
        const findParent = (node, target) => {
            if (!node.children) return null;
            if (node.children.includes(target)) return node;
            for (const child of node.children) {
                const parent = findParent(child, target);
                if (parent) return parent;
            }
            return null;
        };
        return findParent(this.structure, targetItem);
    }

    // Preview
    refreshPreview() {
        const previewEl = document.getElementById('previewContent');
        if (!previewEl) return;

        if (!this.selectedItem || this.selectedItem.type !== 'file') {
            previewEl.innerHTML = '<p class="preview-placeholder">Wähle eine Datei um die Vorschau zu sehen</p>';
            return;
        }
        const content = this.selectedItem.content || '';
        previewEl.innerHTML = this.generatePreview(content);
    }

    generatePreview(content) {
        const lines = (content || '').split('\n');
        let html = '<div class="preview-mock">';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === '-----') continue;

            if (trimmed.startsWith('#')) {
                html += `<div class="preview-question">${trimmed.substring(1).trim()}</div>`;
            } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                html += `<div class="preview-option">${trimmed.slice(1, -1).trim()}</div>`;
            } else if (/^\$[a-zA-Z0-9_]+\$/.test(trimmed)) {
                html += `<div class="preview-variable">Variable: ${trimmed.replace(/\$/g, '')}</div>`;
            } else if (trimmed.startsWith('/')) {
                html += `<div class="preview-input">Eingabefeld: ${trimmed.substring(1)}</div>`;
            } else {
                html += `<div class="preview-text">${trimmed}</div>`;
            }
        }
        html += '</div>';
        return html;
    }

    // Variablen-Ansicht
    refreshVariables() {
        const variablesList = document.getElementById('variablesList');
        if (!variablesList) return;
        const variables = this.extractAllVariables();
        if (variables.length === 0) {
            variablesList.innerHTML = '<p class="variables-placeholder">Keine Variablen gefunden</p>';
            return;
        }
        const variablesHtml = variables.map(v => `
            <div class="variable-item">
                <span class="variable-name">${v.name}</span>
                <span class="variable-type">${v.type}</span>
            </div>
        `).join('');
        variablesList.innerHTML = variablesHtml;
    }

    extractAllVariables() {
        const seen = new Set();
        const result = [];
        const extractFromNode = (node) => {
            if (node.type === 'file' && node.content) {
                for (const match of node.content.matchAll(/\$([a-zA-Z0-9_]+)\$/g)) {
                    const name = match[1];
                    if (!seen.has(name)) {
                        seen.add(name);
                        result.push({ name, type: 'Variable', file: node.name });
                    }
                }
                for (const match of node.content.matchAll(/\[([^\]]+)\]/g)) {
                    const name = match[1];
                    if (!seen.has(name)) {
                        seen.add(name);
                        result.push({ name, type: 'Platzhalter', file: node.name });
                    }
                }
            }
            if (node.children) node.children.forEach(extractFromNode);
        };
        extractFromNode(this.structure);
        return result;
    }

    // Stats
    updateStats() {
        const stats = this.calculateStats();
        const filesEl = document.getElementById('statFiles');
        const foldersEl = document.getElementById('statFolders');
        const varsEl = document.getElementById('statVariables');
        const countEl = document.getElementById('itemCount');
        if (filesEl) filesEl.textContent = String(stats.files);
        if (foldersEl) foldersEl.textContent = String(stats.folders);
        if (varsEl) varsEl.textContent = String(stats.variables);
        if (countEl) countEl.textContent = `${stats.total} Elemente`;
    }

    calculateStats() {
        let files = 0, folders = 0, variables = 0;
        const countItems = (node) => {
            if (node.type === 'folder') {
                folders++;
            } else if (node.type === 'file') {
                files++;
                if (node.content) {
                    const matches = node.content.match(/\$[a-zA-Z0-9_]+\$/g);
                    if (matches) variables += matches.length;
                }
            }
            if (node.children) node.children.forEach(countItems);
        };
        if (this.structure && this.structure.children) this.structure.children.forEach(countItems);
        return { files, folders, variables, total: files + folders };
    }

    // Export/Import
    async exportZip() {
        try {
            this.setStatus('ZIP wird erstellt...');
            if (!ZipProcessor || typeof ZipProcessor.createZip !== 'function') throw new Error('ZipProcessor nicht verfügbar');
            const blob = await ZipProcessor.createZip(this.structure);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'juri-dialog-struktur.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.setStatus('ZIP erfolgreich exportiert!');
        } catch (error) {
            console.error('Export error:', error);
            this.setStatus('Fehler beim Export', 'error');
        }
    }

    importZip() {
        const input = document.getElementById('zipFileInput');
        if (input) input.click();
    }

    save() {
        this.saveStructure();
        this.setStatus('Gespeichert!');
    }

    async deployToChatbot() {
        try {
            this.setStatus('Deploy wird vorbereitet...');
            if (!ZipProcessor || typeof ZipProcessor.createZip !== 'function') throw new Error('ZipProcessor nicht verfügbar');
            const blob = await ZipProcessor.createZip(this.structure);
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = String(reader.result).split(',')[1];
                if (DialogStorage && typeof DialogStorage.saveZip === 'function') {
                    DialogStorage.saveZip(base64);
                }
                this.setStatus('Erfolgreich deployed! Chatbot nutzt jetzt die neue Struktur.');
                window.open('/', '_blank');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Deploy error:', error);
            this.setStatus('Fehler beim Deploy', 'error');
        }
    }

    // Tabs und Events
    attachEventListeners() {
        const zipInput = document.getElementById('zipFileInput');
        if (zipInput) {
            zipInput.addEventListener('change', (e) => this.handleZipImport(e));
        }

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const name = target && target.dataset ? target.dataset.tab : null;
                if (name) this.switchTab(name);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const key = (e.key || '').toLowerCase();
                if (key === 's') {
                    e.preventDefault();
                    this.save();
                } else if (key === 'n') {
                    e.preventDefault();
                    this.newFile();
                }
            }
        });
    }

    initTabs() {
        this.switchTab('content');
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const pane = document.getElementById(`${tabName}Tab`);
        if (pane) pane.classList.add('active');

        if (tabName === 'preview') this.refreshPreview();
        if (tabName === 'variables') this.refreshVariables();
    }

    // Struktur laden/speichern
    createEmptyStructure() {
        return { name: 'Root', type: 'folder', children: [], path: '' };
    }

    loadStructure() {
        try {
            return DialogStorage && typeof DialogStorage.load === 'function' ? DialogStorage.load() : null;
        } catch (_) {
            return null;
        }
    }

    saveStructure() {
        try {
            if (DialogStorage && typeof DialogStorage.save === 'function') {
                DialogStorage.save(this.structure);
            }
            this.setStatus('Struktur gespeichert');
        } catch (error) {
            console.error('Save error:', error);
        }
    }

    async handleZipImport(event) {
        const file = event && event.target ? event.target.files && event.target.files[0] : null;
        if (!file) return;
        try {
            this.setStatus('ZIP-Datei wird importiert...');
            if (!ZipProcessor || typeof ZipProcessor.parseZip !== 'function') throw new Error('ZipProcessor nicht verfügbar');
            const structure = await ZipProcessor.parseZip(file);
            this.structure = structure;
            if (this.treeEditor && typeof this.treeEditor.setStructure === 'function') {
                this.treeEditor.setStructure(structure);
            }
            if (this.treeEditor) this.treeEditor.render();
            this.updateStats();
            this.setStatus('ZIP erfolgreich importiert!');
        } catch (error) {
            console.error('Import error:', error);
            this.setStatus('Fehler beim Importieren der ZIP-Datei', 'error');
        }
    }

    updateBreadcrumb(item) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        if (!item || !item.path) {
            breadcrumb.innerHTML = '<span class="breadcrumb-item">Root</span>';
            return;
        }
        const parts = item.path.split('/');
        const items = ['Root', ...parts].map((part, index, arr) => {
            const isLast = index === arr.length - 1;
            return isLast
                ? `<span class="breadcrumb-item">${part}</span>`
                : `<span class="breadcrumb-item">${part}</span><span class="breadcrumb-separator"> / </span>`;
        });
        breadcrumb.innerHTML = items.join('');
    }

    setCurrentFile(item) {
        const el = document.getElementById('currentFile');
        if (!el) return;
        if (item && item.type === 'file') {
            el.textContent = item.name;
        } else {
            el.textContent = 'Keine Datei ausgewählt';
        }
    }

    setStatus(message, type = 'info') {
        const statusText = document.getElementById('statusText');
        if (!statusText) return;
        statusText.textContent = message;
        statusText.className = type;
        setTimeout(() => {
            statusText.textContent = 'Bereit';
            statusText.className = '';
        }, 5000);
    }
}

// Globale Instanziierung, falls auf editor.html
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname || '';
    if (path.includes('editor.html')) {
        window.editor = new EditorMain();
    }
});


