const loginSchema = {
  body: {
    type: 'object',
    required: ['name', 'password'],
    properties: {
      name: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 6 },
    },
  },
};

module.exports = {
  loginSchema,
};
