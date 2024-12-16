import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorService {
  static handleError(error: any, defaultMessage: string): never {
    // If error is already an HTTP exception, rethrow it
    if (error instanceof HttpException) {
      throw error;
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Validation Error',
          message: Object.values(error.errors).map((err: any) => err.message),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Duplicate Entry',
          message: 'A record with this information already exists',
          field: Object.keys(error.keyPattern)[0],
        },
        HttpStatus.CONFLICT,
      );
    }

    // Handle other errors with a generic message
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: defaultMessage,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
