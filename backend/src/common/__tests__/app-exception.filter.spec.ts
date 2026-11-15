import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AppError } from '../errors/app.error';
import { AppExceptionFilter } from '../filters/app-exception.filter';

describe('AppExceptionFilter', () => {
  const filter = new AppExceptionFilter();

  function createHost(): {
    host: ArgumentsHost;
    status: jest.Mock;
    json: jest.Mock;
  } {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as ArgumentsHost;

    return { host, status, json };
  }

  it('maps AppError codes to HTTP status and body', () => {
    const { host, status, json } = createHost();

    filter.catch(new AppError('not_found', 'Company not found.'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      code: 'not_found',
      message: 'Company not found.',
    });
  });

  it('maps Nest HttpException to the shared body shape', () => {
    const { host, status, json } = createHost();

    filter.catch(new HttpException('Bad input', HttpStatus.BAD_REQUEST), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'bad_request',
      message: 'Bad input',
    });
  });

  it('hides unexpected errors behind a generic message', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('secret stack detail'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'unavailable',
      message: 'An unexpected error occurred.',
    });
  });
});
