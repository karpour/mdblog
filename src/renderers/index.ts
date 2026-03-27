import ArticleMarkdownRenderer from "./ArticleMarkdownRenderer";
import Html4MarkdownRenderer from "./Html4MarkdownRenderer";
import Html5MarkdownRenderer from "./Html5MarkdownRenderer";
import WmlMarkdownRenderer from "./WMLMarkdownRenderer";

export * from "./ArticleMarkdownRenderer";
export * from "./Html4MarkdownRenderer";
export * from "./Html5MarkdownRenderer";
export * from "./GopherMarkdownRenderer";

export const RENDERER_TYPES = ["html4", "html5", "wml"] as const;

export type RendererType = typeof RENDERER_TYPES[number];

export const getRenderers = (hostname: string): Record<RendererType, ArticleMarkdownRenderer> => ({
    "html5": new Html5MarkdownRenderer(hostname),
    "html4": new Html4MarkdownRenderer(hostname),
    //"text": new LynxMarkdownRenderer(hostname),
    "wml": new WmlMarkdownRenderer(hostname)
});