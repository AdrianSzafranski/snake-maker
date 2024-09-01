export interface CommentResponseDto {
    id: number;
    content: string;
    date: Date;
    authorUsername: string;
    authorAvatar: string[];
}
  
 export interface PostResponseDto {
    id: number;
    title: string;
    content: string;
    imageUrl: string;
    date: Date;
    comments: CommentResponseDto[] | [];
}