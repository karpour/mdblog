

export interface ArticleProps {
    title: string;
    tags: string[];
    categories: string[];
    slug?: string;
    date: Date;
    author?: string;
    draft?: boolean;
}
