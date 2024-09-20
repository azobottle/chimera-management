// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options, formDataBodySerializer } from '@hey-api/client-fetch';
import type { GetAllUsersError, GetAllUsersResponse, UpdateUserData, UpdateUserError, UpdateUserResponse, CreateUserData, CreateUserError, CreateUserResponse, GetAllProductCatesError, GetAllProductCatesResponse, UpdateProductCateData, UpdateProductCateError, UpdateProductCateResponse, CreateProductCateData, CreateProductCateError, CreateProductCateResponse, GetAllProductsError, GetAllProductsResponse, UpdateProductData, UpdateProductError, UpdateProductResponse, CreateProductData, CreateProductError, CreateProductResponse, GetAllProductOptionsError, GetAllProductOptionsResponse, UpdateProductOptionData, UpdateProductOptionError, UpdateProductOptionResponse, CreateProductOptionData, CreateProductOptionError, CreateProductOptionResponse, GetAllAddressesError, GetAllAddressesResponse, UpdateAddressData, UpdateAddressError, UpdateAddressResponse, CreateAddressData, CreateAddressError, CreateAddressResponse, GetAllActivitiesError, GetAllActivitiesResponse, UpdateActivityData, UpdateActivityError, UpdateActivityResponse, CreateActivityData, CreateActivityError, CreateActivityResponse, UploadImageData, UploadImageError, UploadImageResponse, GetAllProcessorMapsError, GetAllProcessorMapsResponse, CreateProcessorMapData, CreateProcessorMapError, CreateProcessorMapResponse, GetAllOrdersError, GetAllOrdersResponse, CreateOrderData, CreateOrderError, CreateOrderResponse, LoginData, LoginError, LoginResponse, GetUserByNameData, GetUserByNameError, GetUserByNameResponse, ExistsByCateIdData, ExistsByCateIdError, ExistsByCateIdResponse, GetAddressByNameData, GetAddressByNameError, GetAddressByNameResponse } from './types.gen';

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

export const getAllAddresses = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllAddressesResponse, GetAllAddressesError, ThrowOnError>({
    ...options,
    url: '/address'
}); };

export const updateAddress = <ThrowOnError extends boolean = false>(options: Options<UpdateAddressData, ThrowOnError>) => { return (options?.client ?? client).put<UpdateAddressResponse, UpdateAddressError, ThrowOnError>({
    ...options,
    url: '/address'
}); };

export const createAddress = <ThrowOnError extends boolean = false>(options: Options<CreateAddressData, ThrowOnError>) => { return (options?.client ?? client).post<CreateAddressResponse, CreateAddressError, ThrowOnError>({
    ...options,
    url: '/address'
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

export const getAllOrders = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => { return (options?.client ?? client).get<GetAllOrdersResponse, GetAllOrdersError, ThrowOnError>({
    ...options,
    url: '/order'
}); };

export const createOrder = <ThrowOnError extends boolean = false>(options: Options<CreateOrderData, ThrowOnError>) => { return (options?.client ?? client).post<CreateOrderResponse, CreateOrderError, ThrowOnError>({
    ...options,
    url: '/order'
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

export const getAddressByName = <ThrowOnError extends boolean = false>(options: Options<GetAddressByNameData, ThrowOnError>) => { return (options?.client ?? client).get<GetAddressByNameResponse, GetAddressByNameError, ThrowOnError>({
    ...options,
    url: '/address/{school}'
}); };