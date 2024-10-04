// This file is auto-generated by @hey-api/openapi-ts

export const ObjectIdSchema = {
    type: 'string'
} as const;

export const UserSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        openid: {
            type: 'string'
        },
        sessionKey: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        hashedPassword: {
            type: 'string'
        },
        school: {
            type: 'string'
        },
        role: {
            type: 'string'
        },
        jwt: {
            type: 'string'
        },
        expend: {
            type: 'number',
            format: 'double'
        },
        orderNum: {
            type: 'integer',
            format: 'int32'
        },
        address: {
            type: 'string'
        },
        createdAt: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const ProductCateSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        title: {
            type: 'string'
        },
        status: {
            type: 'integer',
            format: 'int32'
        },
        priority: {
            type: 'integer',
            format: 'int32'
        },
        delete: {
            type: 'integer',
            format: 'int32'
        }
    }
} as const;

export const OptionValueSchema = {
    required: ['uuid'],
    type: 'object',
    properties: {
        uuid: {
            type: 'string'
        },
        value: {
            type: 'string'
        },
        priceAdjustment: {
            type: 'integer',
            format: 'int32'
        }
    }
} as const;

export const ProductSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        cateId: {
            '$ref': '#/components/schemas/ObjectId'
        },
        name: {
            type: 'string'
        },
        imgURL: {
            type: 'string'
        },
        price: {
            type: 'integer',
            format: 'int32'
        },
        describe: {
            type: 'string'
        },
        short_desc: {
            type: 'string'
        },
        status: {
            type: 'integer',
            format: 'int32'
        },
        delete: {
            type: 'integer',
            format: 'int32'
        },
        productOptions: {
            type: 'object',
            additionalProperties: {
                type: 'array',
                items: {
                    '$ref': '#/components/schemas/OptionValue'
                }
            }
        }
    }
} as const;

export const ProductOptionSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        name: {
            type: 'string'
        },
        values: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/OptionValue'
            }
        }
    }
} as const;

export const FixDeliveryInfoSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        school: {
            type: 'string'
        },
        time: {
            type: 'string',
            format: 'date-time'
        },
        address: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    }
} as const;

export const ActivitySchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        title: {
            type: 'string'
        },
        imgURL: {
            type: 'string'
        },
        describe: {
            type: 'string'
        }
    }
} as const;

export const ProcessorMapSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        state: {
            type: 'string'
        },
        event: {
            type: 'string'
        },
        customerTypes: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        scenes: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        processorIds: {
            type: 'array',
            items: {
                type: 'integer',
                format: 'int32'
            }
        }
    }
} as const;

export const DeliveryInfoSchema = {
    type: 'object',
    properties: {
        school: {
            type: 'string'
        },
        address: {
            type: 'string'
        },
        time: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const OrderSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        userId: {
            '$ref': '#/components/schemas/ObjectId'
        },
        state: {
            type: 'string'
        },
        customerType: {
            type: 'string'
        },
        scene: {
            type: 'string'
        },
        deliveryInfo: {
            '$ref': '#/components/schemas/DeliveryInfo'
        },
        items: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/OrderItem'
            }
        },
        orderNum: {
            type: 'integer',
            format: 'int32'
        },
        createdAt: {
            type: 'string',
            format: 'date-time'
        },
        totalPrice: {
            type: 'integer',
            format: 'int32'
        }
    }
} as const;

export const OrderItemSchema = {
    type: 'object',
    properties: {
        productId: {
            '$ref': '#/components/schemas/ObjectId'
        },
        optionValues: {
            type: 'object',
            additionalProperties: {
                '$ref': '#/components/schemas/OptionValue'
            }
        },
        name: {
            type: 'string'
        },
        price: {
            type: 'integer',
            format: 'int32'
        }
    }
} as const;

export const JSONObjectSchema = {
    type: 'object',
    properties: {
        empty: {
            type: 'boolean'
        }
    },
    additionalProperties: {
        type: 'object'
    }
} as const;

export const ServiceResultObjectObjectSchema = {
    type: 'object',
    properties: {
        data: {
            type: 'object'
        },
        context: {
            type: 'object'
        },
        msg: {
            type: 'string'
        },
        success: {
            type: 'boolean'
        }
    }
} as const;

export const LoginDTOSchema = {
    required: ['password', 'username'],
    type: 'object',
    properties: {
        username: {
            type: 'string'
        },
        password: {
            type: 'string'
        }
    }
} as const;