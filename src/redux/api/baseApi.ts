import { JWTDecode } from "@/utils/jwt";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://10.10.13.8:4095/api/v1",
    prepareHeaders: (headers, { endpoint }) => {
      const { token } = JWTDecode();

      // If endpoint is public product catalog or requested skip auth, do not attach admin token
      if (headers.get("x-skip-auth") === "true" || endpoint === "getAllProducts") {
        headers.delete("x-skip-auth");
        return headers;
      }

      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Product",
    "Category",
    "Cart",
    "Wishlist",
    "Order",
    "ShippingAddress",
    "Payment",
    "Feedback",
    "Conversation",
    "Producer",
    "Driver",
    "Admin",
  ],
  endpoints: () => ({}),
});
