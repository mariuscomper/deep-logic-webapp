/*
 * Small, dependency-free Markdown renderer for this static essay.
 * It intentionally escapes source text and only allows safe link protocols.
 */
(function (global) {
    'use strict';

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeHref(value) {
        const href = String(value).trim();
        if (/^(https?:|mailto:|#|\/)/i.test(href)) return escapeHtml(href);
        return '#';
    }

    function inlineMarkdown(source) {
        const placeholders = [];
        const protect = (html) => {
            const token = `\u0000${placeholders.length}\u0000`;
            placeholders.push(html);
            return token;
        };

        let value = escapeHtml(source);
        value = value.replace(/`([^`\n]+)`/g, (_, code) => protect(`<code>${code}</code>`));
        value = value.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url, title) => {
            const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
            return protect(`<img src="${safeHref(url)}" alt="${escapeHtml(alt)}"${titleAttribute}>`);
        });
        value = value.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, url, title) => {
            const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
            return protect(`<a href="${safeHref(url)}"${titleAttribute}>${label}</a>`);
        });
        value = value.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        value = value.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
        value = value.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        value = value.replace(/_([^_\n]+)_/g, '<em>$1</em>');
        value = value.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

        return value.replace(/\u0000(\d+)\u0000/g, (_, index) => placeholders[Number(index)]);
    }

    function isBlockStart(line) {
        return /^(#{1,6})\s+/.test(line)
            || /^([-*_])(?:\s*\1){2,}\s*$/.test(line)
            || /^>\s?/.test(line)
            || /^\s*([-*+]\s+|\d+[.]\s+)/.test(line)
            || /^```/.test(line);
    }

    function renderBlocks(source) {
        const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
        const output = [];
        let index = 0;

        while (index < lines.length) {
            const line = lines[index];
            if (!line.trim()) {
                index += 1;
                continue;
            }

            const fence = line.match(/^```\s*([\w-]*)\s*$/);
            if (fence) {
                index += 1;
                const codeLines = [];
                while (index < lines.length && !/^```\s*$/.test(lines[index])) {
                    codeLines.push(lines[index]);
                    index += 1;
                }
                if (index < lines.length) index += 1;
                const classAttribute = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : '';
                output.push(`<pre><code${classAttribute}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
                continue;
            }

            const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
            if (heading) {
                const level = heading[1].length;
                output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
                index += 1;
                continue;
            }

            if (/^([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
                output.push('<hr>');
                index += 1;
                continue;
            }

            if (/^>\s?/.test(line)) {
                const quoteLines = [];
                while (index < lines.length && (/^>\s?/.test(lines[index]) || !lines[index].trim())) {
                    quoteLines.push(lines[index].replace(/^>\s?/, ''));
                    index += 1;
                }
                output.push(`<blockquote>${renderBlocks(quoteLines.join('\n'))}</blockquote>`);
                continue;
            }

            const listMatch = line.match(/^\s*([-*+]\s+|\d+[.]\s+)(.*)$/);
            if (listMatch) {
                const ordered = /^\d/.test(listMatch[1]);
                const items = [];
                while (index < lines.length) {
                    const itemMatch = lines[index].match(/^\s*([-*+]\s+|\d+[.]\s+)(.*)$/);
                    if (!itemMatch || (/^\d/.test(itemMatch[1])) !== ordered) break;
                    items.push(`<li>${inlineMarkdown(itemMatch[2])}</li>`);
                    index += 1;
                }
                const tag = ordered ? 'ol' : 'ul';
                output.push(`<${tag}>${items.join('')}</${tag}>`);
                continue;
            }

            const paragraph = [line];
            index += 1;
            while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
                paragraph.push(lines[index]);
                index += 1;
            }
            output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
        }

        return output.join('\n');
    }

    global.marked = {
        parse: renderBlocks,
        setOptions: function () {}
    };
}(window));
