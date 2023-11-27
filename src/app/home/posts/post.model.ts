export interface PostData {
    id?: string;
    title: string;
    content: string;
    imageUrl: string;
    data: Date;
}

export interface PostComment {
    postId?: string;
    authorId: string;
    authorUsername?: string;
    authorAvatar?: string;
    content: string;
    date: Date;
}
