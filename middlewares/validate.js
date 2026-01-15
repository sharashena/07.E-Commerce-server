export const validate = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      stripUnknown: true,
      abortEarly: false,
    });

    if (error) {
      const errorsArr = error.details.map(err => ({
        field: err.path.join(","),
        message: err.message,
      }));
      return next(errorsArr);
    }
    next();
  };
};
