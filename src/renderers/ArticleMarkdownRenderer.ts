import { encode } from "html-entities";
import MarkdownIt from "markdown-it";
import Renderer from "markdown-it/lib/renderer";
import Token from "markdown-it/lib/token";
import path from "path";
import { Article } from "../Article";
import { markdownItCheckbox } from "./markdownItCheckbox";

const vimeoRE = /^(?:https?:\/\/)?(?:www\.)?vimeo.com\/(?<id>\d+)($|\/)/;
const youtubeRE = /^(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/)(?:watch\?v=|v\/|embed\/)?([^&\s?]+)\S*$/;
const VIDEO_EXTENSIONS = [".webm", ".mp4", ".wmv"];

abstract class ArticleMarkdownRenderer extends MarkdownIt {
    public constructor(protected hostname: string) {
        super();

        const defaultImageRenderRule = this.renderer.rules.image;
        if (!defaultImageRenderRule) throw new Error(`No default image renderer`);
        const thisInstance = this;


        this.renderer.rules.image = function (tokens: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {

            const token = tokens[idx];
            const src = token?.attrs?.[token.attrIndex('src')]?.[1] ?? '';
            token.children?.forEach(t => t.attrSet("image_text", "true"));
            let title: string | undefined = token.children ? self.renderInline(token.children, options, env) : undefined;
            let alt: string | undefined = token?.attrs?.[token.attrIndex('title')]?.[1] ?? undefined;
            if (!title) {
                title = alt;
                alt = undefined;
            }

            let re: RegExpExecArray | null = null;
            if (re = vimeoRE.exec(src)) {
                return thisInstance.renderVimeo(re[1], title, alt);
            } else if (re = youtubeRE.exec(src)) {
                return thisInstance.renderYouTube(re[1], title, alt);
            } else if (VIDEO_EXTENSIONS.includes(path.extname(src))) {
                return thisInstance.renderVideo(src, title, alt);
            }
            return thisInstance.renderImage(src, title, alt);
        };
    }

    public abstract renderImage(url: string, title?: string, alt?: string): string;
    public abstract renderVideo(url: string, title?: string, alt?: string): string;
    public abstract renderYouTube(videoIs: string, title?: string, alt?: string): string;
    public abstract renderVimeo(videoIs: string, title?: string, alt?: string): string;


    public render(src: string, env?: any) {
        return super.render(src, env);
    }

    //public abstract renderArticle(article: Article): string;
}

export default ArticleMarkdownRenderer;