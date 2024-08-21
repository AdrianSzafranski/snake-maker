import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private static readonly ERROR_PRIORITIES: Record<string, number> = {
    'array': 1,
    'required': 2,
    'string': 3,
    'minlength': 4,
    'maxlength': 5,
    'minsize': 6,
    'maxsize': 7,
    'pattern': 8,
    // Add more error types with priorities as needed
  };

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const exceptionResponse = exception.getResponse() as any;
    let errorMessages: string[] = [];

    // Handle the case where exceptionResponse.message is a string or array
    if (Array.isArray(exceptionResponse.message)) {
      errorMessages = exceptionResponse.message;
    } else if (typeof exceptionResponse.message === 'string') {
      errorMessages = [exceptionResponse.message];
    } else {
      errorMessages = []; // Fallback to empty array if message is neither string nor array
    }

    // Create a map of errors grouped by field with the highest priority error
    const formattedErrors: Record<string, string> = {};

    errorMessages.forEach(message => {
      // Extract field name and error type assuming format is "field.errorType"
      const parts = message.split('.');
      if (parts.length === 2) {
        const field = parts[0];
        const errorType = parts[1];
        const priority = ValidationExceptionFilter.ERROR_PRIORITIES[errorType] || Infinity;

        if (!formattedErrors[field]) {
          // Use the first error for each field
          formattedErrors[field] = message;
        } else {
          // If the current message has a higher priority, replace the previous one
          const currentErrorType = formattedErrors[field].split('.')[1];
          const currentPriority = ValidationExceptionFilter.ERROR_PRIORITIES[currentErrorType] || Infinity;
          if (priority < currentPriority) {
            formattedErrors[field] = message;
          }
        }
      }
    });

    response.status(400).json({
      statusCode: 400,
      path: request.url,
      message: Object.keys(formattedErrors).length > 0 ? formattedErrors : 'error.unknown',
    });
  }
}
