const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
}

// const asyncHandler = () => {}
// const asyncHandler = (func) =>  (req, res, next) => {}

// const asyncHandler = (func) => async (req, res, next) => {  // wrapper
//     try {
//         await func (req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// };

export default asyncHandler;
