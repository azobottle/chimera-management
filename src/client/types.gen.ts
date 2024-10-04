// This file is auto-generated by @hey-api/openapi-ts

export type ObjectId = string;

export type User = {
    id?: ObjectId;
    openid?: string;
    sessionKey?: string;
    name?: string;
    hashedPassword?: string;
    school?: string;
    role?: string;
    jwt?: string;
    expend?: number;
    orderNum?: number;
    address?: string;
    createdAt?: string;
};

export type ProductCate = {
    id?: ObjectId;
    title?: string;
    status?: number;
    priority?: number;
    delete?: number;
};

export type OptionValue = {
    uuid: string;
    value?: string;
    priceAdjustment?: number;
};

export type Product = {
    id?: ObjectId;
    cateId?: ObjectId;
    name?: string;
    imgURL?: string;
    price?: number;
    describe?: string;
    short_desc?: string;
    status?: number;
    delete?: number;
    productOptions?: {
        [key: string]: Array<OptionValue>;
    };
};

export type ProductOption = {
    id?: ObjectId;
    name?: string;
    values?: Array<OptionValue>;
};

export type FixDeliveryInfo = {
    id?: ObjectId;
    school?: string;
    time?: string;
    address?: Array<(string)>;
};

export type Activity = {
    id?: ObjectId;
    title?: string;
    imgURL?: string;
    describe?: string;
};

export type ProcessorMap = {
    id?: ObjectId;
    state?: string;
    event?: string;
    customerTypes?: Array<(string)>;
    scenes?: Array<(string)>;
    processorIds?: Array<(number)>;
};

export type DeliveryInfo = {
    school?: string;
    address?: string;
    time?: string;
};

export type Order = {
    id?: ObjectId;
    userId?: ObjectId;
    state?: string;
    customerType?: string;
    scene?: string;
    deliveryInfo?: DeliveryInfo;
    items?: Array<OrderItem>;
    orderNum?: number;
    createdAt?: string;
    totalPrice?: number;
};

export type OrderItem = {
    productId?: ObjectId;
    optionValues?: {
        [key: string]: OptionValue;
    };
    name?: string;
    price?: number;
};

export type JSONObject = {
    empty?: boolean;
    [key: string]: (unknown | boolean) | undefined;
};

export type ServiceResultObjectObject = {
    data?: {
        [key: string]: unknown;
    };
    context?: {
        [key: string]: unknown;
    };
    msg?: string;
    success?: boolean;
};

export type LoginDTO = {
    username: string;
    password: string;
};

export type GetAllUsersResponse = (Array<User>);

export type GetAllUsersError = unknown;

export type UpdateUserData = {
    body: User;
};

export type UpdateUserResponse = (User);

export type UpdateUserError = unknown;

export type CreateUserData = {
    body: User;
};

export type CreateUserResponse = (User);

export type CreateUserError = unknown;

export type GetAllProductCatesResponse = (Array<ProductCate>);

export type GetAllProductCatesError = unknown;

export type UpdateProductCateData = {
    body: ProductCate;
};

export type UpdateProductCateResponse = (ProductCate);

export type UpdateProductCateError = unknown;

export type CreateProductCateData = {
    body: ProductCate;
};

export type CreateProductCateResponse = (ProductCate);

export type CreateProductCateError = unknown;

export type GetAllProductsResponse = (Array<Product>);

export type GetAllProductsError = unknown;

export type UpdateProductData = {
    body: Product;
};

export type UpdateProductResponse = (Product);

export type UpdateProductError = unknown;

export type CreateProductData = {
    body: Product;
};

export type CreateProductResponse = (Product);

export type CreateProductError = unknown;

export type GetAllProductOptionsResponse = (Array<ProductOption>);

export type GetAllProductOptionsError = unknown;

export type UpdateProductOptionData = {
    body: ProductOption;
};

export type UpdateProductOptionResponse = (ProductOption);

export type UpdateProductOptionError = unknown;

export type CreateProductOptionData = {
    body: ProductOption;
};

export type CreateProductOptionResponse = (ProductOption);

export type CreateProductOptionError = unknown;

export type GetAllFixDeliveryInfosResponse = (Array<FixDeliveryInfo>);

export type GetAllFixDeliveryInfosError = unknown;

export type UpdateFixDeliveryInfoData = {
    body: FixDeliveryInfo;
};

export type UpdateFixDeliveryInfoResponse = (FixDeliveryInfo);

export type UpdateFixDeliveryInfoError = unknown;

export type CreateFixDeliveryInfoData = {
    body: FixDeliveryInfo;
};

export type CreateFixDeliveryInfoResponse = (FixDeliveryInfo);

export type CreateFixDeliveryInfoError = unknown;

export type GetAllActivitiesResponse = (Array<Activity>);

export type GetAllActivitiesError = unknown;

export type UpdateActivityData = {
    body: Activity;
};

export type UpdateActivityResponse = (Activity);

export type UpdateActivityError = unknown;

export type CreateActivityData = {
    body?: {
        activity: Activity;
        image: (Blob | File);
    };
};

export type CreateActivityResponse = (Activity);

export type CreateActivityError = unknown;

export type UploadImageData = {
    body?: {
        image: (Blob | File);
    };
};

export type UploadImageResponse = (string);

export type UploadImageError = unknown;

export type GetAllProcessorMapsResponse = (Array<ProcessorMap>);

export type GetAllProcessorMapsError = unknown;

export type CreateProcessorMapData = {
    body: ProcessorMap;
};

export type CreateProcessorMapResponse = (ProcessorMap);

export type CreateProcessorMapError = unknown;

export type CallbackData = {
    body: string;
};

export type CallbackResponse = (string);

export type CallbackError = unknown;

export type CreateData = {
    body: Order;
};

export type CreateResponse = (JSONObject);

export type CreateError = unknown;

export type SupplyOrderData = {
    body: Order;
};

export type SupplyOrderResponse = (ServiceResultObjectObject);

export type SupplyOrderError = unknown;

export type RefundOrderData = {
    body: Order;
};

export type RefundOrderResponse = (ServiceResultObjectObject);

export type RefundOrderError = unknown;

export type CreateOrderInStoreData = {
    body: Order;
};

export type CreateOrderInStoreResponse = (ServiceResultObjectObject);

export type CreateOrderInStoreError = unknown;

export type AfterSaleData = {
    body: Order;
};

export type AfterSaleResponse = (ServiceResultObjectObject);

export type AfterSaleError = unknown;

export type WxLoginOrRegisterData = {
    body: JSONObject;
};

export type WxLoginOrRegisterResponse = (string);

export type WxLoginOrRegisterError = unknown;

export type LoginData = {
    body: LoginDTO;
};

export type LoginResponse = (string);

export type LoginError = unknown;

export type GetUserByNameData = {
    path: {
        name: string;
    };
};

export type GetUserByNameResponse = (User);

export type GetUserByNameError = unknown;

export type ExistsByCateIdData = {
    query: {
        cateId: string;
    };
};

export type ExistsByCateIdResponse = (boolean);

export type ExistsByCateIdError = unknown;

export type GetAllOrdersResponse = (Array<Order>);

export type GetAllOrdersError = unknown;

export type GetOrdersByUserIdData = {
    path: {
        userId: string;
    };
};

export type GetOrdersByUserIdResponse = (Array<Order>);

export type GetOrdersByUserIdError = unknown;

export type DeleteFixDeliveryInfoData = {
    path: {
        id: string;
    };
};

export type DeleteFixDeliveryInfoResponse = (unknown);

export type DeleteFixDeliveryInfoError = unknown;