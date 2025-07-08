import {
    type WSClientOptions,
    type WSClientEvent,
    type WSClientEventListener,
    type WSClientEventMap,
} from '@/types/webSocketClient'

/**
 * Wraps the WebSocket API to provide a client with an event and promise based API.
 * Additionally, it can automatically attempt to reconnect if the connection is lost.
 */
export class WebSocketClient {
    /**
     * The ready states of the WebSocket connection.
     */
    static readonly READY_STATE = {
        CLOSED: WebSocket.CLOSED,
        CLOSING: WebSocket.CLOSING,
        CONNECTING: WebSocket.CONNECTING,
        OPEN: WebSocket.OPEN,
    }

    private serverUrl: string
    private options: WSClientOptions

    private ws!: WebSocket
    private reconnectTimeout: NodeJS.Timeout | null = null
    private eventListeners: { [E in WSClientEvent]: WSClientEventListener<E>[] } = {
        open: [],
        error: [],
        close: [],
        message: [],
    }

    /**
     * Create a new WebSocketClient instance.
     *
     * @param serverUrl The WebSocket server URL to connect to.
     * @param options Optional settings for reconnection and delay.
     */
    constructor(serverUrl: string, options: Partial<WSClientOptions> = {}) {
        this.serverUrl = serverUrl
        this.options = {
            reconnect: true,
            reconnectDelay: 10000,
            ...options,
        }
        this.open()
    }

    /**
     * Open a WebSocket connection to the server.
     */
    private open() {
        // Create a new WebSocket instance and set up event handlers
        this.ws = new WebSocket(this.serverUrl)
        this.ws.onopen = this.onWsOpen.bind(this)
        this.ws.onerror = this.onWSError.bind(this)
        this.ws.onclose = this.onWsClose.bind(this)
        this.ws.onmessage = this.onWsMessage.bind(this)
    }

    /**
     * Close the WebSocket connection.
     *
     * @returns A promise that resolves to true if the connection was closed successfully, false if it was already closed.
     */
    public async close(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            // Override the close event handler to resolve the promise and prevent automatic reconnection
            this.ws.onclose = () => {
                this.callEventListeners('close')
                resolve(true)
            }

            // Clear the reconnect timeout if it exists
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout)
            }

            if (this.ws.readyState === WebSocket.CLOSED) {
                // If the WebSocket is already closed, resolve with false
                resolve(false)
                return
            } else if (this.ws.readyState === WebSocket.CLOSING) {
                // If the WebSocket is closing, wait for it to close. The onclose handler will resolve the promise
                return
            }

            // Close the WebSocket connection
            this.ws.close()
        })
    }

    /**
     * Handle the WebSocket open event.
     */
    private onWsOpen() {
        this.callEventListeners('open')
    }

    /**
     * Handle the WebSocket error event.
     *
     * @param error The error event from the WebSocket.
     */
    private onWSError(error: Event) {
        this.callEventListeners('error', error)
    }

    /**
     * Handle the WebSocket close event.
     */
    private onWsClose() {
        this.callEventListeners('close')
        if (!this.options.reconnect) return

        // Try to reconnect after the specified delay
        this.reconnectTimeout = setTimeout(() => {
            this.open()
        }, this.options.reconnectDelay)
    }

    /**
     * Handle incoming WebSocket messages.
     */
    private onWsMessage(event: MessageEvent) {
        this.callEventListeners('message', event)
    }

    /**
     * Call all listeners for a specific event type.
     *
     * @param event The event type to call listeners for.
     * @param args The argument to pass to the event listeners.
     */
    private callEventListeners<E extends WSClientEvent>(
        event: E,
        ...args: WSClientEventMap[E] extends void ? [] : [eventData: WSClientEventMap[E]]
    ) {
        for (const listener of this.eventListeners[event]) {
            listener(...(args as [WSClientEventMap[E]]))
        }
    }

    /**
     * Add an event listener for a specific WebSocket event.
     *
     * @param event The event type to listen for.
     * @param callback The callback function to call when the event occurs.
     */
    public addEventListener<E extends WSClientEvent>(event: E, callback: (event: WSClientEventMap[E]) => void) {
        this.eventListeners[event].push(callback)
    }

    /**
     * Remove an event listener for a specific WebSocket event.
     *
     * @param event The event type to stop listening for.
     * @param callback The callback function to remove.
     */
    public removeEventListener<E extends WSClientEvent>(event: E, callback: WSClientEventListener<E>) {
        const index = this.eventListeners[event].indexOf(callback)
        if (index === -1) return
        this.eventListeners[event].splice(index, 1)
    }

    /**
     * Get the current ready state of the WebSocket connection.
     *
     * Use `WebSocketClient.READY_STATE` to compare against the ready states:
     * - `WebSocketClient.READY_STATE.CLOSED`
     * - `WebSocketClient.READY_STATE.CLOSING`
     * - `WebSocketClient.READY_STATE.CONNECTING`
     * - `WebSocketClient.READY_STATE.OPEN`
     *
     * @returns The current ready state of the WebSocket connection.
     */
    public getReadyState(): number {
        return this.ws.readyState
    }
}
