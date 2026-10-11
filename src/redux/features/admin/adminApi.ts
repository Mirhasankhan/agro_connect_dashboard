import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TPaginationMeta,
  TProducerProfile,
  TDriverProfile,
  VerificationStatus,
  ProducerType,
  DriverVehicleType,
  TCategory,
  OrderStatus,
} from "@/types";

export interface ProducerQueryParams {
  search?: string;
  verificationStatus?: VerificationStatus;
  producerType?: ProducerType;
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

export interface DriverQueryParams {
  search?: string;
  verificationStatus?: VerificationStatus;
  vehicleType?: DriverVehicleType;
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

export interface BaseUserQueryParams {
  search?: string;
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

export interface OrderQueryParams {
  search?: string;
  status?: OrderStatus;
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

export interface TProducerUser {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  producerProfile?: TProducerProfile | null;
  products?: any[];
  producerEarnings?: any[];
}

export interface TDriverUser {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  status?: string;
  driverProfile?: TDriverProfile | null;
  deliveries?: any[];
  driverEarnings?: any[];
}

export interface TBuyerUser {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  status?: string;
  shippingAddresses?: any[];
  orders?: any[];
  _count?: {
    orders?: number;
  };
}

export interface TAdminOrder {
  id: string;
  orderId: string;
  totalAmount: number;
  createdAt: string;
  status?: OrderStatus;
  _count?: {
    items: number;
  };
  customer?: {
    fullName: string;
    profileImage?: string | null;
  };
  shippingAddress?: {
    addressLine: string;
    city: string;
  };
}

export interface AcceptRejectPayload {
  accountId: string;
  isAccept: boolean;
  rejectReason?: string;
}

export interface AssignDriverPayload {
  orderId: string;
  driverId: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // PRODUCERS
    getAllProducers: builder.query<
      TApiResponse<{ producers: TProducerUser[]; meta: TPaginationMeta }>,
      ProducerQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-producers",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Producer", "User"],
    }),

    getProducerDetails: builder.query<TApiResponse<{ producer: TProducerUser }>, string>({
      query: (id) => ({
        url: `/admin/producer-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Producer", id }],
    }),

    acceptRejectProducer: builder.mutation<TApiResponse<null>, AcceptRejectPayload>({
      query: (payload) => ({
        url: "/admin/producer-approval",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Producer", "User"],
    }),

    // DRIVERS
    getAllDrivers: builder.query<
      TApiResponse<{ drivers: TDriverUser[]; meta: TPaginationMeta }>,
      DriverQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-drivers",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Driver", "User"],
    }),

    getDriverDetails: builder.query<TApiResponse<{ driver: TDriverUser }>, string>({
      query: (id) => ({
        url: `/admin/driver-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Driver", id }],
    }),

    acceptRejectDriver: builder.mutation<TApiResponse<null>, AcceptRejectPayload>({
      query: (payload) => ({
        url: "/admin/driver-approval",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Driver", "User"],
    }),

    // BUYERS
    getAllBuyers: builder.query<
      TApiResponse<{ buyers: TBuyerUser[]; meta: TPaginationMeta }>,
      BaseUserQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-buyers",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["User"],
    }),

    getBuyerDetails: builder.query<TApiResponse<{ buyer: TBuyerUser }>, string>({
      query: (id) => ({
        url: `/admin/buyer-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // CATEGORIES
    getAllCategories: builder.query<TApiResponse<{ categories: TCategory[] }>, void>({
      query: () => ({
        url: "/admin/all-categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<TApiResponse<null>, FormData>({
      query: (formData) => ({
        url: "/admin/create-category",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Category"],
    }),

    toggleCategoryStatus: builder.mutation<TApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/toggle-category-status/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),

    // ORDERS
    getAllOrders: builder.query<
      TApiResponse<{ orders: TAdminOrder[]; meta: TPaginationMeta }>,
      OrderQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-orders",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Order"],
    }),

    assignDriver: builder.mutation<TApiResponse<null>, AssignDriverPayload>({
      query: (payload) => ({
        url: "/admin/assign-driver",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Order", "Driver"],
    }),
  }),
});

export const {
  useGetAllProducersQuery,
  useGetProducerDetailsQuery,
  useAcceptRejectProducerMutation,
  useGetAllDriversQuery,
  useGetDriverDetailsQuery,
  useAcceptRejectDriverMutation,
  useGetAllBuyersQuery,
  useGetBuyerDetailsQuery,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useToggleCategoryStatusMutation,
  useGetAllOrdersQuery,
  useAssignDriverMutation,
} = adminApi;
