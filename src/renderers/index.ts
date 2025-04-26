import Html4MarkdownRenderer from "./Html4MarkdownRenderer";
import Html5MarkdownRenderer from "./Html5MarkdownRenderer";
import WmlMarkdownRenderer from "./WMLMarkdownRenderer";

export * from "./ArticleMarkdownRenderer";
export * from "./Html4MarkdownRenderer";
export * from "./Html5MarkdownRenderer";
export * from "./GopherMarkdownRenderer";

export const getRenderers = (hostname: string) => ({
    "html5": new Html5MarkdownRenderer(hostname),
    "html4": new Html4MarkdownRenderer(hostname),
    //"text": new LynxMarkdownRenderer(hostname),
    "wml": new WmlMarkdownRenderer(hostname)
});