const getPredictionSchema = {
  querystring: {
    type: 'object',
    required: ['datetime'],
    properties: {
      datetime: { type: 'string', format: 'date-time' },
      room_id: { type: 'integer', nullable: true },
    },
  },
};

const getPredictionsSchema = {
  querystring: {
    type: 'object',
    properties: {
      start_date: { type: 'string', format: 'date-time' },
      end_date: { type: 'string', format: 'date-time' },
      room_id: { type: 'integer', nullable: true },
    },
  },
};

const createPredictionSchema = {
  body: {
    type: 'object',
    properties: {
      datetime: { type: 'string', format: 'date-time' },
      temperature_prediction: { type: 'number', nullable: true },
      max_temperature_prediction: { type: 'number', nullable: true },
      min_temperature_prediction: { type: 'number', nullable: true },
      max_humidity_prediction: { type: 'number', nullable: true },
      min_humidity_prediction: { type: 'number', nullable: true },
    },
  },
};

module.exports = {
  getPredictionSchema,
  getPredictionsSchema,
  createPredictionSchema,
};