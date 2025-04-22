import { encode } from "html-entities";
import ArticleMarkdownRenderer from "./ArticleMarkdownRenderer";
import multimdTable from 'markdown-it-multimd-table';

class Html4MarkdownRenderer extends ArticleMarkdownRenderer {
    public renderVideo(url: string, title?: string | undefined, alt?: string | undefined): string {
        return `<object id="MediaPlayer" width=320 height=286 classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" standby="Loading Windows Media Player ..." type="application/x-oleobject" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112"> 
        <param name="filename" value="${url}">
        <param name="Showcontrols" value="True">
        <param name="autoStart" value="False">
        <param name="wmode" value="transparent">
        <embed type="application/x-mplayer2" src=${url}" name="MediaPlayer" autoStart="False" wmode="transparent" width="320" height="286" ></embed>
        </object>
        <div>${title}</div>`;
    }
    public renderYouTube(videoIs: string, title?: string | undefined, alt?: string | undefined): string {
        throw new Error("Method not implemented.");
    }
    public renderVimeo(videoIs: string, title?: string | undefined, alt?: string | undefined): string {
        throw new Error("Method not implemented.");
    }
    public renderImage(src: string, title?: string | undefined, alt?: string | undefined): string {
        return `<div><img src="${src}" ${alt && `alt="${encode(alt)}"`} /><br>${title && `<b>${title}</b>`}</div>`;
    }

    public constructor(hostname: string) {
        super(hostname);
        this.use(multimdTable);
    }
}

export default Html4MarkdownRenderer;


/*
<object id="MediaPlayer" width=320 height=286 classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" standby="Loading Windows Media Player ..." type="application/x-oleobject" codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">
<param name="filename" value="http://mydomain.com/sample.wmv">
<param name="Showcontrols" value="True">
<param name="autoStart" value="True">
<param name="wmode" value="transparent">
<embed type="application/x-mplayer2" src=http://mydomain.com/sample.wmv" name="MediaPlayer" autoStart="True" wmode="transparent" width="320" height="286" ></embed>
</object>
*/

/* Quicktime
<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="256" width="320">

<param name="src" value="http://www.mydomain.com/sample.mp4">
<param name="autoplay" value="false">
<param name="target" value="myself">
<param name="controller" value="false">
<param name="href" value="http://www.mydomain.com/sample.mp4">
<param name="type" value="video/quicktime" height="256" width="320">

<embed src="http://www.1st-host.com/sample.mp4" height="256" width="320" autoplay="false" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/" controller="false" href="http://www.mydomain.com/sample.mp4" target="myself"></embed>
</object>
*/

//ffmpeg -i test.mp4 -c:v wmv2 -b:v 1024k -c:a wmav2 -b:a 192k test1.wmv