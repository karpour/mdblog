import Token from "markdown-it/lib/token";
import MarkdownIt from "markdown-it";
import path from "path";
import ArticleMarkdownRenderer from "./ArticleMarkdownRenderer";
import Renderer, { RenderRule } from "markdown-it/lib/renderer";
import createYoutubeVideoUrl from "./createYoutubeVideoUrl";
import createVimeoVideoUrl from "./createVimeoVideoUrl";

function gopherImage(caption: string, path: string, server: string, port: number): string {
    return `I${caption}\t${path}\t${server}\t${port}`;
}

function gopherLink(caption: string, path: string, server: string, port: number = 70): string {
    return `9${caption}\t${path}\t${server}\t${port}`;
}

function gopherHttpLink(caption: string, url: string, server: string, port: number = 70) {
    return `h${caption}\tURL:${url}\t${server}\t${port}`;
}

function gopherInfo(text: string): string[] {
    return text.split(/\r?\n/).map(t => `i${t}`);
}


class GopherMarkdownRenderer extends ArticleMarkdownRenderer {
    public constructor(hostname: string) {
        super(hostname);

        this.renderer.rules.heading_open = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            //console.log(tokens);

            const insideTokens = [];
            let i = 1;
            // wtf?? need to do this differently
            while (tokens[idx + i].type !== "heading_close") {
                insideTokens.push(tokens[idx + i]);
                i++;
            }
            insideTokens.filter(t => t.type === "inline").forEach(t => t.children?.forEach(t => t.attrSet("render_inline", "true")));

            return `i${tokens[idx].markup} `;


        };

        this.renderer.rules.heading_close = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            return `\ni\n`;
        };

        this.renderer.rules.paragraph_open = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            //console.log(tokens[idx]);
            return ``;
        };


        this.renderer.rules.paragraph_close = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            //console.log(tokens[idx]);
            return `\ni\n`;
        };

        this.renderer.rules.fence = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            //console.log(tokens[idx]);
            return gopherInfo(tokens[idx].content).join('\n') + '\n';
        };

        this.renderer.rules.hardbreak = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            return `\ni\n`;
        };

        this.renderer.rules.link_open = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            //console.log(tokens);
            let url = tokens[idx].attrGet("href") ?? "/";

            const insideTokens = [];
            let i = 1;
            // wtf?? need to do this differently
            while (tokens[idx + i].type !== "link_close") {
                insideTokens.push(tokens[idx + i]);
                tokens[idx + i].attrSet("render_inline", "true");
                i++;
            }
            let innerText = self.renderInline(insideTokens, options, env);
            insideTokens.forEach(t => t.attrSet("dont_render", "true"));
            let linkCaption = innerText;
            if (!(url.startsWith("https://") || url.startsWith("http://"))) {
                url = path.join("http://", hostname, url);
                const urlObj = new URL(url);
                const pathname = urlObj.pathname;
                return gopherLink(innerText, pathname, hostname);
            } else {
                return gopherHttpLink(linkCaption, url, hostname);
            }
        };

        this.renderer.rules.link_close = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            return "";
        };

        this.renderer.rules.text = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
            if (tokens[idx].attrGet("dont_render")) return "";
            if (tokens[idx].attrGet("render_inline") || tokens[idx].attrGet("image_text")) return tokens[idx].content;
            //console.log(`TEXT: ${tokens[idx].content}`);
            //console.log(tokens[idx])
            return gopherInfo(tokens[idx].content).join('\n');
        };
    }

    public renderVideo(url: string, title?: string | undefined, alt?: string | undefined): string {
        return gopherHttpLink(title ?? alt ?? url, url, this.hostname);
    }

    public renderYouTube(videoId: string, title?: string | undefined, alt?: string | undefined): string {
        return gopherHttpLink(title ?? alt ?? `YouTube videoid ${videoId}`, createYoutubeVideoUrl(videoId), this.hostname);
    }

    public renderVimeo(videoId: string, title?: string | undefined, alt?: string | undefined): string {
        return gopherHttpLink(title ?? alt ?? `Vimeo videoid ${videoId}`, createVimeoVideoUrl(videoId), this.hostname);
    }

    public renderImage(src: string, title?: string | undefined, alt?: string | undefined): string {
        let imagelines = [gopherImage(`Image: ${title ?? path.basename(src)}`, src, this.hostname, 70)];
        if (alt) imagelines.push(...gopherInfo(alt));
        return imagelines.join('\n');
    }
};

export default GopherMarkdownRenderer;


export const text = `# Header

Paragraph line 1
Paragraph line 2

## Header 2

Para para paragraph

\`\`\`typescript
var a=1;
async function main() {
    test();
}  
\`\`\`

Paragraph 3

![Image](/image.png "Image caption")

[Link title](http://www.giga.de "Title 2")

[Link title2](blub "Title 2")
`;




//console.log(new GopherMarkdownRenderer("karpour.net").render(text));