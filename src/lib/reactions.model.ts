export type ReactionType = "like" | "dislike";

export type ReactionAction = "add" | "remove";

export type ArticleReactions = {
  likes: number;
  dislikes: number;
};
