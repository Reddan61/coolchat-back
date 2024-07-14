const createResponseError = (text) => {
    return {
        status: "error",
        message: text
    }
}

module.exports = {
    createResponseError
}