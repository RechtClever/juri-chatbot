const ZipProcessor = {
    async parseZip(fileOrBlob) {
        const jszip = window.JSZip;
        if (!jszip) throw new Error('JSZip nicht verfügbar');
        const zip = await jszip.loadAsync(fileOrBlob);
        const root = { name: 'Root', type: 'folder', path: '', children: [] };
        const ensureFolder = (pathParts) => {
            let node = root;
            for (const part of pathParts) {
                let child = node.children.find(c => c.type === 'folder' && c.name === part);
                if (!child) {
                    child = { name: part, type: 'folder', children: [], path: node.path ? `${node.path}/${part}` : part };
                    node.children.push(child);
                }
                node = child;
            }
            return node;
        };
        await Promise.all(Object.keys(zip.files).map(async (fileName) => {
            const entry = zip.files[fileName];
            if (entry.dir) return;
            const parts = fileName.split('/');
            const name = parts.pop();
            const folderNode = ensureFolder(parts.filter(Boolean));
            const content = await entry.async('string');
            folderNode.children.push({ name, type: 'file', content, path: folderNode.path ? `${folderNode.path}/${name}` : name });
        }));
        return root;
    },
    async createZip(structure) {
        const jszip = window.JSZip;
        if (!jszip) throw new Error('JSZip nicht verfügbar');
        const zip = new jszip();
        const addNode = (node, folder) => {
            if (node.type === 'folder' && node.children) {
                const sub = folder.folder(node.name);
                node.children.forEach(child => addNode(child, sub));
            } else if (node.type === 'file') {
                zip.file(node.path || node.name, node.content || '');
            }
        };
        const rootFolder = zip.folder('dialog');
        if (structure.children) structure.children.forEach(child => addNode(child, rootFolder));
        return await zip.generateAsync({ type: 'blob' });
    }
};

window.ZipProcessor = ZipProcessor;


