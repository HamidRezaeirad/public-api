import axios, { AxiosError, isAxiosError } from 'axios'

export type NestErrorBody = {
  statusCode: number
  code: string
  message: string
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(body: NestErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.statusCode = body.statusCode
    this.code = body.code
  }
}

function isNestErrorBody(value: unknown): value is NestErrorBody {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.statusCode === 'number' &&
    typeof record.code === 'string' &&
    typeof record.message === 'string'
  )
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAxiosError(error)) {
    const data = error.response?.data
    if (isNestErrorBody(data)) {
      return new ApiError(data)
    }

    return new ApiError({
      statusCode: error.response?.status ?? 0,
      code: 'unavailable',
      message: error.message || 'Request failed',
    })
  }

  if (error instanceof Error) {
    return new ApiError({
      statusCode: 0,
      code: 'unavailable',
      message: error.message,
    })
  }

  return new ApiError({
    statusCode: 0,
    code: 'unavailable',
    message: 'Unexpected error',
  })
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }
  return 'Request failed'
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
)
