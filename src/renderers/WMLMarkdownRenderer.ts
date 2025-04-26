import MarkdownIt from 'markdown-it';
import ArticleMarkdownRenderer from './ArticleMarkdownRenderer';

export class WmlMarkdownRenderer extends ArticleMarkdownRenderer {
    public renderImage(url: string, title?: string, alt?: string): string {
        throw new Error('Method not implemented.');
    }
    public renderVideo(url: string, title?: string, alt?: string): string {
        throw new Error('Method not implemented.');
    }
    public renderYouTube(videoIs: string, title?: string, alt?: string): string {
        throw new Error('Method not implemented.');
    }
    public renderVimeo(videoIs: string, title?: string, alt?: string): string {
        throw new Error('Method not implemented.');
    }
    public constructor(hostname: string) {
        super(hostname);

        this.renderer.rules.text = (tokens, idx) => tokens[idx].content;

        // Emphasis and strong are stripped (WML 1.0 doesn’t support rich formatting)
        this.renderer.rules.strong_open = () => '';
        this.renderer.rules.strong_close = () => '';
        this.renderer.rules.em_open = () => '';
        this.renderer.rules.em_close = () => '';

        // Paragraphs
        this.renderer.rules.paragraph_open = () => '<p>';
        this.renderer.rules.paragraph_close = () => '</p>';

        // Headings become <p>Text</p> (WML 1.0 doesn’t support heading tags)
        this.renderer.rules.heading_open = () => '<p>';
        this.renderer.rules.heading_close = () => '</p>';

        // Lists: flatten into <p>* Item</p>
        this.renderer.rules.bullet_list_open = () => '';
        this.renderer.rules.bullet_list_close = () => '';
        this.renderer.rules.list_item_open = () => '<p>* ';
        this.renderer.rules.list_item_close = () => '</p>';

        // Blockquotes treated as <p>| Quote</p>
        this.renderer.rules.blockquote_open = () => '<p>| ';
        this.renderer.rules.blockquote_close = () => '</p>';

        
        // Inline code
        this.renderer.rules.code_inline = (tokens, idx) =>
            `<![CDATA[${tokens[idx].content}]]>`;

        // Links: WML 1.0 <anchor><go href="..."/><anchor>
        this.renderer.rules.link_open = (tokens, idx) => {
            const href = tokens[idx].attrGet('href');
            return `<anchor><go href="${href}"/>`;
        };
        this.renderer.rules.link_close = () => '</anchor>';
    }
}

export default WmlMarkdownRenderer;
