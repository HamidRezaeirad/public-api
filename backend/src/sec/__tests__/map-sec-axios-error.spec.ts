import { AppError } from '../../common/errors/app.error';
import { mapSecAxiosError } from '../errors/map-sec-axios-error';

describe('mapSecAxiosError', () => {
  it.each([
    [404, 'not_found', 'SEC resource was not found.'],
    [403, 'forbidden', 'SEC rejected the request. Check SEC_USER_AGENT.'],
    [429, 'rate_limited', 'SEC rate limit exceeded. Retry later.'],
    [503, 'unavailable', 'SEC service is unavailable.'],
  ] as const)('maps HTTP %s to %s', (status, code, message) => {
    expect(
      mapSecAxiosError({
        isAxiosError: true,
        response: { status },
      }),
    ).toEqual(new AppError(code, message));
  });

  it('maps timeouts to timeout', () => {
    expect(
      mapSecAxiosError({
        isAxiosError: true,
        code: 'ECONNABORTED',
      }),
    ).toEqual(new AppError('timeout', 'SEC request timed out.'));
  });
});
