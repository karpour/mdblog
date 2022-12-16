import YtDlp from 'yt-dlp-wrap';


let ytdlp = new YtDlp();


export default async function downloadVideo(url: string, target: string): Promise<string> {
    return ytdlp.execPromise([
        url,
        '-f',
        'best',
        '-o',
        target,
    ]).then(resp => { return target; });
}
