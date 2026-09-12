export interface Testimonial {
  id: string;
  title: string;       // e.g. "Network, 1976 [Film]"
  recommender: string; // e.g. "Rec by Kezia"
  quote: string;       // e.g. "The perfect watch if you missed Abhinandan's lecture..."
  order_index?: number;
  created_at?: string;
}
