export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  reviewerName: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
};
