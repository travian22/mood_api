// Helper untuk serialize BigInt ke JSON
const serializeBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

/**
 * Fungsi helper untuk mengirim response sukses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (200, 201, dll)
 * @param {*} data - Data yang akan dikirim
 * @param {String} message - Pesan sukses (opsional)
 */
export const sendSuccess = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    status: 'success',
    message: message,
    data: serializeBigInt(data)
  });
};

/**
 * Fungsi helper untuk mengirim response fail (client error)
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (400, 404, dll)
 * @param {*} errors - Error details (bisa object atau string)
 */
export const sendFail = (res, statusCode, errors) => {
  return res.status(statusCode).json({
    status: 'fail',
    errors: errors
  });
};

/**
 * Fungsi helper untuk mengirim response error (server error)
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (500, 503, dll)
 * @param {String} message - Error message
 */
export const sendError = (res, statusCode, message = 'Internal server error') => {
  return res.status(statusCode).json({
    status: 'error',
    message: message
  });
};
