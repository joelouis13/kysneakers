export type ReviewStatus = "pending" | "approved" | "rejected";

export type AdminReviewListItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  reviewerName: string;
  reviewerEmail: string | null;
  isGuest: boolean;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  createdAt: string;
};
