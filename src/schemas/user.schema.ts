const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'password'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      password: { type: 'string', minLength: 6 },
      photo: { type: 'string', nullable: true },
    },
  },
};

const updateUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      password: { type: 'string', minLength: 6 },
      photo: { type: 'string', nullable: true },
      role_id: { type: 'integer' },
    },
  },
};

const deleteUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
};

const getUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' },
    },
  },
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  getUserSchema,
};