class EnhancedDialogParser {
    parseFile(content, fileName = '') {
        const sections = String(content || '').split('-----');
        const header = (sections[0] || '').trim();
        const body = (sections[1] || '').trim();
        const scriptBlock = (sections.slice(2).join('-----') || '').trim();
        const node = { fileName, titel: '', untertitel: '', bezeichner: '', fragetyp: 'Text', antworten: [], script: '', dokumenttext: '' };
        // Titel/Untertitel (# Titel, Rest als Untertitel)
        const lines = header.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
            if (lines[0].startsWith('#')) { node.titel = lines[0].replace(/^#\s*/, ''); lines.shift(); }
            if (lines.length > 0) { node.untertitel = lines.join(' '); }
        }
        // Body: Bezeichner, Input, Optionen
        body.split('\n').forEach(l => {
            const trimmed = l.trim(); if (!trimmed) return;
            if (/^\$[a-zA-Z0-9_]+\$/.test(trimmed)) { node.bezeichner = trimmed; return; }
            if (trimmed.startsWith('/')) { node.fragetyp = this.mapInputTypeToQuestionType(trimmed.substring(1)); return; }
            if (trimmed.startsWith('(') && trimmed.endsWith(')')) { node.antworten.push(trimmed.slice(1, -1).trim()); return; }
        });
        // Script extrahieren (\\ Script Start ... \\ Script End)
        const scriptMatch = scriptBlock.match(/\\\s*Script Start[\s\S]*?\n([\s\S]*?)\\\s*Script End/);
        if (scriptMatch) node.script = scriptMatch[1].trim();
        // Dokumenttext (vereinfachte Markierung [Dokument] ...)
        const docMatch = scriptBlock.match(/\[Dokument\]\s*([\s\S]*)$/);
        if (docMatch) node.dokumenttext = docMatch[1].trim();
        return node;
    }
    mapInputTypeToQuestionType(inputType) {
        const map = { text: 'Text', number: 'Number', currency: 'Currency', date: 'Date', person: 'Person', address: 'Address' };
        return map[inputType] || 'Text';
    }
    executeScript(script, variables) {
        const context = { ...variables };
        let gotoTarget = null;
        const api = {
            get: (k) => context[k],
            set: (k, v) => { context[k] = v; },
            goto: (id) => { gotoTarget = id; }
        };
        try {
            const fn = new Function('api', 'vars', `with(vars){ ${script} }`);
            fn(api, context);
        } catch (e) { console.warn('Script error:', e); }
        return { goto: gotoTarget, variables: context };
    }
    generateDocument(template, variables) {
        return String(template).replace(/\[([a-zA-Z0-9_]+)\]/g, (m, n) => variables[n] || m);
    }
}

window.EnhancedDialogParser = EnhancedDialogParser;


