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
  PaymentStatus,
  TAdminProducerEarning,
  TAdminDriverEarning,
  TEarningQueryParams,
} from "@/types";

export type { TAdminProducerEarning, TAdminDriverEarning, TEarningQueryParams };

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

export type TReportStatus = "Pending" | "Resolved" | "Rejected";

export interface TAdminReport {
  id: string;
  reason: string;
  fileUrl?: string | null;
  adminComment?: string | null;
  status: TReportStatus;
  createdAt: string;
  updatedAt?: string;
  buyer?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
  };
  orderItem?: {
    id: string;
    productName: string;
    sellingUnit: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: string;
    order?: {
      id: string;
      orderId: string;
      status: string;
      paymentStatus: string;
      totalAmount: number;
      createdAt: string;
    };
    product?: {
      id: string;
      name: string;
      imageUrls: string[];
      producer?: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber?: string | null;
        profileImage?: string | null;
        producerProfile?: {
          farmName?: string | null;
        } | null;
      };
    };
    producerEarning?: {
      id: string;
      amount: number;
      isTransferred: boolean;
      paidAt?: string | null;
    } | null;
  };
}

export interface ReportQueryParams {
  search?: string;
  status?: TReportStatus;
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

export interface ResolveReportPayload {
  status: "Resolved" | "Rejected";
  adminComment?: string;
}

export interface TProducerProduct {
  id: string;
  name: string;
  imageUrls: string[];
  availableQuantity: number;
  avgRating: number;
  totalReviews: number;
  pricePerUnit: number;
  sellingUnit: string;
  sold: number;
  description: string;
  category?: {
    name: string;
  };
  _count?: {
    orderItems: number;
  };
  pricingTiers?: {
    quantity: number;
    pricePerUnit: number;
  }[];
  orderItems?: {
    quantity: number;
    subtotal: number;
    unitPrice: number;
    status: string;
  }[];
  reviews?: {
    rating: number;
    comment: string;
    createdAt: string;
    buyer?: {
      fullName: string;
      profileImage?: string | null;
    };
  }[];
}

export interface TProducerEarningItem {
  amount: number;
  isTransferred: boolean;
  paidAt?: string | null;
  createdAt: string;
  orderItem?: {
    productName: string;
    sellingUnit: string;
    quantity: number;
  };
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
  producerProfile?: (TProducerProfile & {
    experienceYears?: number;
    registrationNumber?: string;
    taxId?: string;
    nationalId?: string;
    bio?: string;
    certificateUrls?: string[];
  }) | null;
  products?: TProducerProduct[];
  producerEarnings?: TProducerEarningItem[];
}

export interface TDriverDeliveryItem {
  id: string;
  status: string;
  order?: {
    orderId: string;
    totalAmount: number;
    shippingAddress?: {
      addressLine: string;
      city: string;
      postCode: string;
      instruction?: string | null;
    };
    items?: {
      productName: string;
      sellingUnit: string;
      quantity: number;
      subtotal: number;
      unitPrice: number;
    }[];
  };
}

export interface TDriverEarningItem {
  amount: number;
  isTransferred: boolean;
  paidAt?: string | null;
  createdAt: string;
  order?: {
    orderId: string;
    deliveryCharge: number;
  };
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
  driverProfile?: (TDriverProfile & {
    drivingLicenseNumber?: string;
    licenseUrls?: string[];
  }) | null;
  deliveries?: TDriverDeliveryItem[];
  driverEarnings?: TDriverEarningItem[];
}

export interface TBuyerOrderItem {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: {
    productName: string;
    sellingUnit: string;
    quantity: number;
    subtotal: number;
    unitPrice: number;
  }[];
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
  shippingAddresses?: {
    addressLine: string;
    city: string;
    postCode: string;
    instruction?: string | null;
  }[];
  orders?: TBuyerOrderItem[];
  _count?: {
    orders?: number;
  };
}

export interface TAdminOrder {
  id: string;
  orderId: string;
  totalAmount: number;
  deliveryCharge?: number;
  createdAt: string;
  status?: OrderStatus;
  paymentStatus?: string;
  deliveries?: Array<{
    id: string;
    status: string;
  }>;
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

export interface TAdminOrderDetail {
  id: string;
  orderId: string;
  totalAmount: number;
  deliveryCharge: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    profileImage?: string | null;
    city?: string | null;
    address?: string | null;
    region?: string | null;
  };
  shippingAddress?: {
    id: string;
    addressLine: string;
    city: string;
    postCode: string;
    instruction?: string | null;
  };
  deliveries?: {
    id: string;
    status: string;
    latitude?: number | null;
    longitude?: number | null;
    heading?: number | null;
    speed?: number | null;
    isTracking?: boolean;
    trackingStartedAt?: string | null;
    trackingUpdatedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    driver?: {
      id: string;
      fullName: string;
      email: string;
      phoneNumber?: string | null;
      profileImage?: string | null;
      driverProfile?: {
        vehicleType: string;
        registrationNumber: string;
        drivingLicenseUrl?: string;
        isAvailable: boolean;
      };
    };
  }[];
  items: {
    id: string;
    productName: string;
    sellingUnit: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: string;
    cancelReason?: string | null;
    isReviewed: boolean;
    createdAt: string;
    product?: {
      id: string;
      name: string;
      imageUrls: string[];
      description?: string;
      category?: {
        name: string;
      };
      producer?: {
        id: string;
        fullName: string;
        email: string;
        phoneNumber?: string | null;
        profileImage?: string | null;
        producerProfile?: {
          farmName?: string;
          farmSize?: number;
          producerType?: string;
        };
      };
    };
    producerEarning?: {
      amount: number;
      isTransferred: boolean;
      paidAt?: string | null;
    };
    review?: {
      rating: number;
      comment: string;
    };
    report?: {
      id: string;
      reason: string;
      fileUrl?: string | null;
      adminComment?: string | null;
      status: TReportStatus;
    } | null;
  }[];
  driverEarning?: {
    amount: number;
    isTransferred: boolean;
    paidAt?: string | null;
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

    getOrderDetails: builder.query<TApiResponse<{ order: TAdminOrderDetail }>, string>({
      query: (id) => ({
        url: `/admin/order-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    assignDriver: builder.mutation<TApiResponse<null>, AssignDriverPayload>({
      query: (payload) => ({
        url: "/admin/assign-driver",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Order", "Driver"],
    }),

    // EARNINGS
    getAllProducerEarnings: builder.query<
      TApiResponse<{ earnings: TAdminProducerEarning[]; meta: TPaginationMeta }>,
      TEarningQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-producer-earnings",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Producer", "Admin"],
    }),

    getAllDriverEarnings: builder.query<
      TApiResponse<{ earnings: TAdminDriverEarning[]; meta: TPaginationMeta }>,
      TEarningQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-driver-earnings",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Driver", "Admin"],
    }),

    transferProducerEarning: builder.mutation<TApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/transfer-producer-earning/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Producer", "Admin", "Payment"],
    }),

    transferDriverEarning: builder.mutation<TApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/transfer-driver-earning/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Driver", "Admin", "Payment"],
    }),

    // REPORTS & QUALITY DISPUTES
    getAllReports: builder.query<
      TApiResponse<{ reports: TAdminReport[]; meta: TPaginationMeta }>,
      ReportQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/all-reports",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Admin", "Order"],
    }),

    getReportDetails: builder.query<TApiResponse<{ report: TAdminReport }>, string>({
      query: (id) => ({
        url: `/admin/report-details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Admin", id }],
    }),

    resolveReport: builder.mutation<
      TApiResponse<null>,
      { id: string; payload: ResolveReportPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/admin/resolve-report/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Admin", "Order", "Producer", "Payment"],
    }),

    getDeliveryTrackingSnapshot: builder.query<
      TApiResponse<any>,
      string
    >({
      query: (deliveryId) => ({
        url: `/order/delivery/tracking/${deliveryId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
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
  useGetOrderDetailsQuery,
  useAssignDriverMutation,
  useGetAllProducerEarningsQuery,
  useGetAllDriverEarningsQuery,
  useTransferProducerEarningMutation,
  useTransferDriverEarningMutation,
  useGetAllReportsQuery,
  useGetReportDetailsQuery,
  useResolveReportMutation,
  useGetDeliveryTrackingSnapshotQuery,
} = adminApi;
