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
        openId: {
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
            type: 'number',
            format: 'double'
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
        productOptionIds: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/ObjectId'
            }
        }
    }
} as const;

export const AddressSchema = {
    type: 'object',
    properties: {
        id: {
            '$ref': '#/components/schemas/ObjectId'
        },
        school: {
            type: 'string'
        },
        address: {
            type: 'string'
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

export const OptionValueSchema = {
    type: 'object',
    properties: {
        value: {
            type: 'string'
        },
        priceAdjustment: {
            type: 'number',
            format: 'double'
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
        items: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/OrderItem'
            }
        }
    }
} as const;

export const OrderItemSchema = {
    type: 'object',
    properties: {
        productId: {
            '$ref': '#/components/schemas/ObjectId'
        },
        optionIdToValue: {
            type: 'object',
            additionalProperties: {
                type: 'string'
            }
        },
        quantity: {
            type: 'integer',
            format: 'int32'
        },
        price: {
            type: 'number',
            format: 'double'
        }
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