import { type WSConnectionStatus } from '@/types/webSocketConnection'

type BaseExtMessage<T, P = undefined> = P extends undefined ? { type: T } : { type: T; payload: P }

export type RequestInitialDataMessage = BaseExtMessage<'request-initial-data'>

export type InitialDataMessage = BaseExtMessage<'initial-data', { connectionStatus: WSConnectionStatus }>
export type ConnectionStatusMessage = BaseExtMessage<'connection-status', WSConnectionStatus>

export function isRequestInitialDataMessage(obj: any): obj is RequestInitialDataMessage {
    return typeof obj === 'object' && obj.type === 'request-initial-data'
}

export function isInitialDataMessage(obj: any): obj is InitialDataMessage {
    const CONNECTION_STATUSES = ['disconnected', 'connecting', 'connected'] as const
    return (
        typeof obj === 'object' &&
        obj.type === 'initial-data' &&
        typeof obj.payload === 'object' &&
        CONNECTION_STATUSES.includes(obj.payload.connectionStatus)
    )
}

export function isConnectionStatusMessage(obj: any): obj is ConnectionStatusMessage {
    const CONNECTION_STATUSES = ['disconnected', 'connecting', 'connected'] as const
    return typeof obj === 'object' && obj.type === 'connection-status' && CONNECTION_STATUSES.includes(obj.payload)
}
