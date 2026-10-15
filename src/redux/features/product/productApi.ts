import { baseApi } from "../../api/baseApi";
import { TApiResponse, TProduct, TPaginationMeta, SellingUnit } from "@/types";

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  sellingUnit?: SellingUnit;
  status?: "active" | "outOfStock";
  isFeatured?: boolean | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: "pricePerUnit" | "availableQuantity" | "avgRating" | "createdAt";
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query<
      TApiResponse<{ products: TProduct[]; meta: TPaginationMeta }>,
      ProductQueryParams | void
    >({
      query: (params) => ({
        url: "/product/all",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Product"],
    }),

    getProductDetails: builder.query<
      TApiResponse<{ product: TProduct; revenue?: number }>,
      string
    >({
      query: (id) => ({
        url: `/product/details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    toggleProductFeatured: builder.mutation<
      TApiResponse<{ id: string; isFeatured: boolean }>,
      string
    >({
      query: (id) => ({
        url: `/admin/toggle-product-featured/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductDetailsQuery,
  useToggleProductFeaturedMutation,
} = productApi;

