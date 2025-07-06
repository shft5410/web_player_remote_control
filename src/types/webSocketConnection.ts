export type WSConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export const WS_CONNECTION_STATUSES: WSConnectionStatus[] = ['disconnected', 'connecting', 'connected'] as const
