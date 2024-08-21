export interface PostData {
    id?: number;
    title: string;
    content: string;
    imageUrl: string;
    date: string;
}

export interface PostComment {
    postId?: string;
    id: string;
    authorUsername?: string;
    authorAvatar?: string[];
    content: string;
    date: Date;
}
