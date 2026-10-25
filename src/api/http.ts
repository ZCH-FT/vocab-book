const BASE_URL = import.meta.env.DEV ? 'http://localhost:8080' : 'https://16527144.r8.cpolar.cn'
export type ApiErrorKind = 'network' | 'http' | 'business' | 'parse'

export class ApiError extends Error {
    kind: ApiErrorKind
    httpStatus: number | null

    constructor(kind: ApiErrorKind, message: string, httpStatus: number | null = null) {
        super(message)
        this.name = 'ApiError'
        this.kind = kind
        this.httpStatus = httpStatus
    }
}

interface Envelope<T> {
    code: number
    msg: string
    data: T
}

export async function request<T>(path:string, init?: RequestInit): Promise<T> {
    let res: Response
    try {
        res = await fetch(`${BASE_URL}${path}`,{
        headers: {'Content-Type': 'application/json'},
        ...init,
    })
    } catch {
        throw new ApiError('network','网络请求失败：后端未启动或网络不通')
    }

    if(!res.ok) {
        throw new ApiError('http', `请求失败:HTTP ${res.status}`, res.status)
    }

    let body: Envelope<T>
    try{
        body = await res.json()
    } catch {
        throw new ApiError('parse', '响应不是合法 JSON', res.status)
    }

    if(body.code !== 200) {
        throw new ApiError('business', body.msg, res.status)
    }
    
    return body.data
}