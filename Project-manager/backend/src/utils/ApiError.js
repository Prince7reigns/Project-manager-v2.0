class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        data=null,
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }

     toJSON() {
    return {
      success: this.success,
      status: this.statusCode,
      message: this.message,
      errors: this.errors,
      data: this.data
    }
   }
}

export default ApiError;