// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options, formDataBodySerializer } from '@hey-api/client-fetch';
import type { GetAllUsersError, GetAllUsersResponse, UpdateUserData, UpdateUserError, UpdateUserResponse, CreateUserData, CreateUserError, CreateUserResponse, GetAllProductCatesError, GetAllProductCatesResponse, UpdateProductCateData, UpdateProductCateError, UpdateProductCateResponse, CreateProductCateData, CreateProductCateError, CreateProductCateResponse, GetAllProductsError, GetAllProductsResponse, UpdateProductData, UpdateProductError, UpdateProductResponse, CreateProductData, CreateProductError, CreateProductResponse, GetAllProductOptionsError, GetAllProductOptionsResponse, UpdateProductOptionData, UpdateProductOptionError, UpdateProductOptionResponse, CreateProductOptionData, CreateProductOptionError, CreateProductOptionResponse, GetAllFixDeliveryInfosError, GetAllFixDeliveryInfosResponse, UpdateFixDeliveryInfoData, UpdateFixDeliveryInfoError, UpdateFixDeliveryInfoResponse, CreateFixDeliveryInfoData, CreateFixDeliveryInfoError, CreateFixDeliveryInfoResponse, GetAllActivitiesError, GetAllActivitiesResponse, UpdateActivityData, UpdateActivityError, UpdateActivityResponse, CreateActivityData, CreateActivityError, CreateActivityResponse, UploadImageData, UploadImageError, UploadImageResponse, GetAllProcessorMapsError, GetAllProcessorMapsResponse, CreateProcessorMapData, CreateProcessorMapError, CreateProcessorMapResponse, CallbackData, CallbackError, CallbackResponse, CreateData, CreateError, CreateResponse, SupplyOrderData, SupplyOrderError, SupplyOrderResponse, RefundOrderData, RefundOrderError, RefundOrderResponse, CreateOrderInStoreData, CreateOrderInStoreError, CreateOrderInStoreResponse, AfterSaleData, AfterSaleError, AfterSaleResponse, LoginData, LoginError, LoginResponse, GetUserByNameData, GetUserByNameError, GetUserByNameResponse, ExistsByCateIdData, ExistsByCateIdError, ExistsByCateIdResponse, GetAllOrdersError, GetAllOrdersResponse, GetOrdersByUserIdData, GetOrdersByUserIdError, GetOrdersByUserIdResponse, WxLoginOrRegisterData, WxLoginOrRegisterError, WxLoginOrRegisterResponse, DeleteFixDeliveryInfoData, DeleteFixDeliveryInfoError, DeleteFixDeliveryInfoResponse } from './types.gen';

export const client = createClient(createConfig());

export const getAllUsers = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllUsersResponse, GetAllUsersError, ThrowOnError>({
    ...options,
    url: '/user'
}); };

export const updateUser = <ThrowOnError extends boolean = false>(options: Options<UpdateUserData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateUserResponse, UpdateUserError, ThrowOnError>({
    ...options,
    url: '/user'
}); };

export const createUser = <ThrowOnError extends boolean = false>(options: Options<CreateUserData, ThrowOnError>) => { return (options?.client ?? client).post<CreateUserResponse, CreateUserError, ThrowOnError>({
    ...options,
    url: '/user'
}); };

export const getAllProductCates = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllProductCatesResponse, GetAllProductCatesError, ThrowOnError>({
    ...options,
    url: '/product_cates'
}); };

export const updateProductCate = <ThrowOnError extends boolean = false>(options: Options<UpdateProductCateData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateProductCateResponse, UpdateProductCateError, ThrowOnError>({
    ...options,
    url: '/product_cates'
}); };

export const createProductCate = <ThrowOnError extends boolean = false>(options: Options<CreateProductCateData, ThrowOnError>) => { return (options?.client ?? client).post<CreateProductCateResponse, CreateProductCateError, ThrowOnError>({
    ...options,
    url: '/product_cates'
}); };

export const getAllProducts = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllProductsResponse, GetAllProductsError, ThrowOnError>({
    ...options,
    url: '/product'
}); };

export const updateProduct = <ThrowOnError extends boolean = false>(options: Options<UpdateProductData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateProductResponse, UpdateProductError, ThrowOnError>({
    ...options,
    url: '/product'
}); };

export const createProduct = <ThrowOnError extends boolean = false>(options: Options<CreateProductData, ThrowOnError>) => { return (options?.client ?? client).post<CreateProductResponse, CreateProductError, ThrowOnError>({
    ...options,
    url: '/product'
}); };

export const getAllProductOptions = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllProductOptionsResponse, GetAllProductOptionsError, ThrowOnError>({
    ...options,
    url: '/productOption'
}); };

export const updateProductOption = <ThrowOnError extends boolean = false>(options: Options<UpdateProductOptionData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateProductOptionResponse, UpdateProductOptionError, ThrowOnError>({
    ...options,
    url: '/productOption'
}); };

export const createProductOption = <ThrowOnError extends boolean = false>(options: Options<CreateProductOptionData, ThrowOnError>) => { return (options?.client ?? client).post<CreateProductOptionResponse, CreateProductOptionError, ThrowOnError>({
    ...options,
    url: '/productOption'
}); };

export const getAllFixDeliveryInfos = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllFixDeliveryInfosResponse, GetAllFixDeliveryInfosError, ThrowOnError>({
    ...options,
    url: '/fixDeliveryInfo'
}); };

export const updateFixDeliveryInfo = <ThrowOnError extends boolean = false>(options: Options<UpdateFixDeliveryInfoData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateFixDeliveryInfoResponse, UpdateFixDeliveryInfoError, ThrowOnError>({
    ...options,
    url: '/fixDeliveryInfo'
}); };

export const createFixDeliveryInfo = <ThrowOnError extends boolean = false>(options: Options<CreateFixDeliveryInfoData, ThrowOnError>) => { return (options?.client ?? client).post<CreateFixDeliveryInfoResponse, CreateFixDeliveryInfoError, ThrowOnError>({
    ...options,
    url: '/fixDeliveryInfo'
}); };

export const getAllActivities = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllActivitiesResponse, GetAllActivitiesError, ThrowOnError>({
    ...options,
    url: '/activity'
}); };

export const updateActivity = <ThrowOnError extends boolean = false>(options: Options<UpdateActivityData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateActivityResponse, UpdateActivityError, ThrowOnError>({
    ...options,
    url: '/activity'
}); };

export const createActivity = <ThrowOnError extends boolean = false>(options?: Options<CreateActivityData, ThrowOnError>) => { return (options?.client ?? client).post<CreateActivityResponse, CreateActivityError, ThrowOnError>({
    ...options,
    ...formDataBodySerializer,
    headers: {
        'Content-Type': null
    },
    url: '/activity'
}); };

export const uploadImage = <ThrowOnError extends boolean = false>(options?: Options<UploadImageData, ThrowOnError>) => { return (options?.client ?? client).post<UploadImageResponse, UploadImageError, ThrowOnError>({
    ...options,
    ...formDataBodySerializer,
    headers: {
        'Content-Type': null
    },
    url: '/product/uploadImage'
}); };

export const getAllProcessorMaps = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllProcessorMapsResponse, GetAllProcessorMapsError, ThrowOnError>({
    ...options,
    url: '/processorMap'
}); };

export const createProcessorMap = <ThrowOnError extends boolean = false>(options: Options<CreateProcessorMapData, ThrowOnError>) => { return (options?.client ?? client).post<CreateProcessorMapResponse, CreateProcessorMapError, ThrowOnError>({
    ...options,
    url: '/processorMap'
}); };

/**
 * 接收支付结果通知。是腾讯的微信支付系统调用的
 */
export const callback = <ThrowOnError extends boolean = false>(options: Options<CallbackData, ThrowOnError>) => { return (options?.client ?? client).post<CallbackResponse, CallbackError, ThrowOnError>({
    ...options,
    url: '/order/wxcreate_callback'
}); };

/**
 * 创建预支付订单。小程序先调用这个，再调用wx.requestPayment
 */
export const create = <ThrowOnError extends boolean = false>(options: Options<CreateData, ThrowOnError>) => { return (options?.client ?? client).post<CreateResponse, CreateError, ThrowOnError>({
    ...options,
    url: '/order/wxcreate'
}); };

export const supplyOrder = <ThrowOnError extends boolean = false>(options: Options<SupplyOrderData, ThrowOnError>) => { return (options?.client ?? client).post<SupplyOrderResponse, SupplyOrderError, ThrowOnError>({
    ...options,
    url: '/order/supply'
}); };

export const refundOrder = <ThrowOnError extends boolean = false>(options: Options<RefundOrderData, ThrowOnError>) => { return (options?.client ?? client).post<RefundOrderResponse, RefundOrderError, ThrowOnError>({
    ...options,
    url: '/order/refund'
}); };

export const createOrderInStore = <ThrowOnError extends boolean = false>(options: Options<CreateOrderInStoreData, ThrowOnError>) => { return (options?.client ?? client).post<CreateOrderInStoreResponse, CreateOrderInStoreError, ThrowOnError>({
    ...options,
    url: '/order/create'
}); };

export const afterSale = <ThrowOnError extends boolean = false>(options: Options<AfterSaleData, ThrowOnError>) => { return (options?.client ?? client).post<AfterSaleResponse, AfterSaleError, ThrowOnError>({
    ...options,
    url: '/order/after_sale'
}); };

export const login = <ThrowOnError extends boolean = false>(options: Options<LoginData, ThrowOnError>) => { return (options?.client ?? client).post<LoginResponse, LoginError, ThrowOnError>({
    ...options,
    url: '/auth/login'
}); };

export const getUserByName = <ThrowOnError extends boolean = false>(options: Options<GetUserByNameData, ThrowOnError>) => { return (options?.client ?? client).get<GetUserByNameResponse, GetUserByNameError, ThrowOnError>({
    ...options,
    url: '/user/{name}'
}); };

export const existsByCateId = <ThrowOnError extends boolean = false>(options: Options<ExistsByCateIdData, ThrowOnError>) => { return (options?.client ?? client).get<ExistsByCateIdResponse, ExistsByCateIdError, ThrowOnError>({
    ...options,
    url: '/product/existsByCateId'
}); };

export const getAllOrders = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllOrdersResponse, GetAllOrdersError, ThrowOnError>({
    ...options,
    url: '/order'
}); };

export const getOrdersByUserId = <ThrowOnError extends boolean = false>(options: Options<GetOrdersByUserIdData, ThrowOnError>) => { return (options?.client ?? client).get<GetOrdersByUserIdResponse, GetOrdersByUserIdError, ThrowOnError>({
    ...options,
    url: '/order/user/{userId}'
}); };

export const wxLoginOrRegister = <ThrowOnError extends boolean = false>(options: Options<WxLoginOrRegisterData, ThrowOnError>) => { return (options?.client ?? client).get<WxLoginOrRegisterResponse, WxLoginOrRegisterError, ThrowOnError>({
    ...options,
    url: '/auth/wx'
}); };

export const deleteFixDeliveryInfo = <ThrowOnError extends boolean = false>(options: Options<DeleteFixDeliveryInfoData, ThrowOnError>) => { return (options?.client ?? client).delete<DeleteFixDeliveryInfoResponse, DeleteFixDeliveryInfoError, ThrowOnError>({
    ...options,
    url: '/fixDeliveryInfo/{id}'
}); };