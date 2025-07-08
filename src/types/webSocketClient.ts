/**
 * Options for the WebSocket client.
 */
export type WSClientOptions = {
    reconnect: boolean
    reconnectDelay: number // milliseconds
}

/**
 * Map of all possible WebSocket client events and their associated data types.
 */
export type WSClientEventMap = {
    open: void
    error: Event
    close: void
    message: MessageEvent
}

/**
 * Type representing all possible WebSocket client events.
 */
export type WSClientEvent = keyof WSClientEventMap

/**
 * Type representing a listener for a specific WebSocket client event.
 */
export type WSClientEventListener<E extends WSClientEvent> = (event: WSClientEventMap[E]) => void
