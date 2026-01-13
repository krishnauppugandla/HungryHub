const success = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

const created = (res, data, message = "Created successfully") => {
  return res.status(201).json({
    status: "success",
    message,
    data,
  });
};

module.exports = { success, created };
