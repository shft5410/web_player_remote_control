export type WSClientOptions = {
    reconnect: boolean
    reconnectDelay: number // milliseconds
}
export type WSClientEventMap = {
    open: void
    error: Event
    close: void
    message: MessageEvent
}
export type WSClientEvent = keyof WSClientEventMap
export type WSClientEventListener<E extends WSClientEvent> = (event: WSClientEventMap[E]) => void
