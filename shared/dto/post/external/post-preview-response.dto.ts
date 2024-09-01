
export interface PostPreviewResponseDto {
    id: number;
    title: string;
    contentPreview: string;
    imageUrl: string;
    imageAlt: string;
    hashtags: string[];
    likesCount: number;
    commentsCount: number;
    date: Date;
    authorUsername: string;
}

