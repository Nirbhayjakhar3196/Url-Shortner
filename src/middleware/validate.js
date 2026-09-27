

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body ?? {});

        if (!result.success) {
            return res.status(400).json({
                error: result.error.issues[0]?.message || "Invalid request body"
            });
        }

        req.body = result.data;
        next();
    };
};

module.exports = validate;