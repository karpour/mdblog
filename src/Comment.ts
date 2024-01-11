type BlogComment = {
    id: number,
    parent?: number,
    name: string,
    date: Date,
    body: string,
    url?: string,
    approved: boolean,
    authorIp?: string,
}