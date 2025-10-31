const createActivityLogSchema = {
  body: {
    type: 'object',
    required: ['type', 'data'],
    properties: {
      type: { type: 'string', minLength: 1, maxLength: 50 },
      data: { type: 'string' },
      datetime: { type: 'string', nullable: true },
      status: { 
        type: 'string', 
        enum: ['verified', 'no_face', 'unknown'],
        default: 'no_face'
      },
      identity: { type: 'string', nullable: true },
      confidence: { type: 'number', nullable: true },
      distance: { type: 'number', nullable: true },
      file_path: { type: 'string', nullable: true },
      user_id: { type: 'integer', nullable: true },
      camera_id: { type: 'integer', nullable: true },
    },
  },
};

const getActivityLogsSchema = {
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['verified', 'no_face', 'unknown'] },
      user_id: { type: 'integer' },
      camera_id: { type: 'integer' },
      start_date: { type: 'string', format: 'date-time' },
      end_date: { type: 'string', format: 'date-time' },
      limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    },
  },
};

module.exports = {
  createActivityLogSchema,
  getActivityLogsSchema,
};