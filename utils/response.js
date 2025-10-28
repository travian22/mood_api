/**
 * Respon Sukses (2xx)
 * @param {object} res - Objek response Express
 * @param {number} statusCode - Kode status HTTP (e.g., 200, 201)
 * @param {object|array} data - Payload data yang dikirim
 * @param {string} [message] - Pesan sukses opsional
 */
const sendSuccess = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Respon Gagal (4xx - Client Error)
 * e.g., Validasi gagal, Not Found
 * @param {object} res - Objek response Express
 * @param {number} statusCode - Kode status HTTP (e.g., 400, 404)
 * @param {object} data - Objek berisi detail error validasi
 */
const sendFail = (res, statusCode, data) => {
  res.status(statusCode).json({
    status: 'fail',
    data,
  });
};

/**
 * Respon Error (5xx - Server Error)
 * e.g., Database down, bug di kode
 * @param {object} res - Objek response Express
 * @param {number} statusCode - Kode status HTTP (e.g., 500)
 * @param {string} [message] - Pesan error
 */
const sendError = (res, statusCode, message = 'Internal server error') => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = {
  sendSuccess,
  sendFail,
  sendError,
};