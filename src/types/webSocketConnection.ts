/**
 * Type representing the status of a WebSocket connection.
 */
export type WSConnectionStatus = 'disconnected' | 'connecting' | 'connected'

/**
 * List of all possible WebSocket connection statuses.
 */
export const WS_CONNECTION_STATUSES: WSConnectionStatus[] = ['disconnected', 'connecting', 'connected'] as const
