import MarkdownIt from "markdown-it/lib";
import Token from "markdown-it/lib/token";

export function markdownItCheckbox(md: MarkdownIt) {
    md.core.ruler.after('inline', 'github-checkbox', (state) => {
        const tokens = state.tokens;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Only process list items
            if (token.type === 'inline' && tokens[i - 1]?.type === 'list_item_open') {
                const children = token.children;
                if (!children || children.length < 3) continue;

                const checkboxMatch = /^\[([ xX])\]$/.exec(children[0].content);
                if (checkboxMatch && children[1].type === 'text' && children[1].content.startsWith(' ')) {
                    const checked = checkboxMatch[1].toLowerCase() === 'x';

                    // Replace the checkbox syntax with an <input> element
                    const checkboxToken = new Token('html_inline', '', 0);
                    checkboxToken.content = `<input type="checkbox" disabled${checked ? ' checked' : ''}>`;
                    token.children = [checkboxToken, ...children.slice(2)];
                }
            }
        }
    });
}
