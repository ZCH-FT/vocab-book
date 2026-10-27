import { ApiError } from '../api/http'

export function showError(e: unknown, fallback: string) {
    ElMessage.error(e instanceof ApiError ? e.message : fallback)
}