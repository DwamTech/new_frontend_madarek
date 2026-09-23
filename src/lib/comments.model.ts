export type CreateCommentPayload = {
  author_name: string;
  text: string;
  captcha_token: string;
};

export type PendingCommentResponse = {
  message: string;
  comment: {
    id: number;
    author_name: string;
    text: string;
    status: "pending";
    created_at: string;
  };
};
