import ArticleMarkdownRenderer from "./ArticleMarkdownRenderer";
import emoji from 'markdown-it-emoji';
import { encode } from "html-entities";
import highlightjs from "markdown-it-highlightjs";
import multimdTable from 'markdown-it-multimd-table';

class Html5MarkdownRenderer extends ArticleMarkdownRenderer {

    public renderVideo(src: string, title?: string | undefined, alt?: string | undefined): string {
        if (src.endsWith('.webm')) {
            //console.log(tokens[idx]);
            return `<figure><video controls><source src="${src}" type="video/webm"></video>${title && `<figcaption>${title}</figcaption>`}</figure>`;
        } else if (src.endsWith('.mp4')) {
            //console.log(tokens[idx]);
            return `<figure><video controls><source src="${src}" type="video/mp4"></video>${title && `<figcaption>${title}</figcaption>`}</figure>`;
        }
        return `<figure><video controls><source src="${src}"></video>${title && `<figcaption>${title}</figcaption>`}</figure>`;
    }

    public renderYouTube(videoId: string, title?: string | undefined, alt?: string | undefined): string {
        throw new Error("Method not implemented.");
    }

    public renderVimeo(videoId: string, title?: string | undefined, alt?: string | undefined): string {
        return '\n<div class="embed-responsive embed-responsive-16by9">\n' +
            '  <iframe class="embed-responsive-item" src="https://player.vimeo.com/video/' + videoId + '"></iframe>\n' +
            '</div>\n';
    }

    public renderImage(src: string, title?: string | undefined, alt?: string | undefined): string {
        return `<figure><img src="${src}" ${alt && `alt="${encode(alt)}"`} />${title && `<figcaption>${title}</figcaption>`}</figure>`;
        // pass token to default renderer.
        //return defaultImageRenderRule(tokens, idx, options, env, self);
    }

    public constructor(hostname: string) {
        super(hostname);
        this.use(emoji);
        this.use(highlightjs);
        this.use(multimdTable);
    }
}

export default Html5MarkdownRenderer;