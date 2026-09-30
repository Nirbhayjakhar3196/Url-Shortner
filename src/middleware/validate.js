

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body ?? {});

        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message || "Invalid request body";
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage
            });
        }

        req.body = result.data;
        next();
    };
};

module.exports = validate;