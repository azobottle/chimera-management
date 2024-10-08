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
    /**
     * status=0为下架，前端不显示
     */
    status?: number;
    /**
     * 优先级，便于设置显示顺序，已自动排序
     */
    priority?: number;
    /**
     * 对于delete=1的，后端不返回
     */
    delete?: number;
};

/**
 * 加购商品的可选项, key=ProductOption.id
 */
export type OptionValue = {
    uuid: string;
    /**
     * 加购商品的可选项的可选值，如对于"规格"，value可以为"中杯"
     */
    value?: string;
    /**
     * 该可选项的价格调整，>=0
     */
    priceAdjustment?: number;
};

export type Product = {
    id?: ObjectId;
    cateId?: ObjectId;
    name?: string;
    imgURL?: string;
    /**
     * 基础价格
     */
    price?: number;
    /**
     * 详情页描述
     */
    describe?: string;
    /**
     * 菜单列表中，name下面展示的简介
     */
    short_desc?: string;
    /**
     * status=0为下架，前端过滤不显示
     */
    status?: number;
    /**
     * 对于delete=1的，后端不返回
     */
    delete?: number;
    /**
     * 加购商品的可选项, key=ProductOption.id
     */
    productOptions?: {
        [key: string]: Array<OptionValue>;
    };
};

export type ProductOption = {
    id?: ObjectId;
    /**
     * 商品的可选项名称，如"规格"
     */
    name?: string;
    /**
     * 对于一个可选项，所有的可能选值，商铺管理用
     */
    values?: Array<OptionValue>;
};

export type FixDeliveryInfo = {
    id?: ObjectId;
    /**
     * 对应User学生认证后的学校
     */
    school?: string;
    /**
     * 可选时间
     */
    times?: Array<(string)>;
    /**
     * 可选地址
     */
    addresses?: Array<(string)>;
};

export type Activity = {
    id?: ObjectId;
    /**
     * 活动名
     */
    title?: string;
    /**
     * 活动图片
     */
    imgURL?: string;
    /**
     * 活动介绍
     */
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

/**
 * 定时达配送信息
 */
export type DeliveryInfo = {
    school?: string;
    /**
     * 绑定到具体订单实例的已选地址
     */
    address?: string;
    /**
     * 绑定到具体订单实例的已选时间
     */
    time?: string;
};

/**
 * 就是订单呀
 */
export type Order = {
    id?: ObjectId;
    userId?: ObjectId;
    /**
     * 自动填充状态
     */
    state?: string;
    /**
     * 顾客类型，可选："北大学生业务"，"清华学生业务"，"未认证为学生身份的用户业务"
     */
    customerType?: string;
    /**
     * 场景，可选："堂食"，"外带"，"定时达"
     */
    scene?: string;
    deliveryInfo?: DeliveryInfo;
    /**
     * 订单所含商品列表
     */
    items?: Array<OrderItem>;
    /**
     * 自动填充订单号
     */
    orderNum?: number;
    /**
     * 顾客备注
     */
    remark?: string;
    /**
     * 商家备注
     */
    merchantNote?: string;
    /**
     * 前端先计算一个，根据sum(OrderItem.price)-优惠券，后端会check
     */
    totalPrice?: number;
    /**
     * 自动填充创建时间
     */
    createdAt?: string;
};

/**
 * 订单其中的一个商品
 */
export type OrderItem = {
    productId?: ObjectId;
    /**
     * 商品选项，key为ProductOption.id, value为一个完整的OptionValue
     */
    optionValues?: {
        [key: string]: OptionValue;
    };
    /**
     * Product.name
     */
    name?: string;
    /**
     * 根据Product.price和目前optionValues中OptionValue.priceAdjustment计算的价格
     */
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

export type ResponseBodyDTOUserDTO = {
    msg?: string;
    data?: UserDTO;
};

export type UserDTO = {
    id?: string;
    openid?: string;
    name?: string;
    school?: string;
    role?: string;
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

export type LoginData = {
    body: LoginDTO;
};

export type LoginResponse = (ResponseBodyDTOUserDTO);

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

export type GetAllOrdersData = {
    query: {
        endTime: string;
        startTime: string;
    };
};

export type GetAllOrdersResponse = ({
    [key: string]: unknown;
});

export type GetAllOrdersError = unknown;

export type GetOrdersByUserIdData = {
    path: {
        userId: string;
    };
};

export type GetOrdersByUserIdResponse = (Array<Order>);

export type GetOrdersByUserIdError = unknown;

export type WxLoginOrRegisterData = {
    query: {
        code: string;
    };
};

export type WxLoginOrRegisterResponse = (ResponseBodyDTOUserDTO);

export type WxLoginOrRegisterError = unknown;

export type ValidateResponse = (ResponseBodyDTOUserDTO);

export type ValidateError = unknown;

export type DeleteFixDeliveryInfoData = {
    path: {
        id: string;
    };
};

export type DeleteFixDeliveryInfoResponse = (unknown);

export type DeleteFixDeliveryInfoError = unknown;