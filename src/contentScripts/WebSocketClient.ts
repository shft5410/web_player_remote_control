import {
    type WSClientOptions,
    type WSClientEvent,
    type WSClientEventListener,
    type WSClientEventMap,
} from '@/types/webSocketClient'

export class WebSocketClient {
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

    constructor(serverUrl: string, options: Partial<WSClientOptions> = {}) {
        this.serverUrl = serverUrl
        this.options = {
            reconnect: true,
            reconnectDelay: 10000,
            ...options,
        }
        this.open()
    }

    private open() {
        this.ws = new WebSocket(this.serverUrl)
        this.ws.onopen = this.onWsOpen.bind(this)
        this.ws.onerror = this.onWSError.bind(this)
        this.ws.onclose = this.onWsClose.bind(this)
        this.ws.onmessage = this.onWsMessage.bind(this)
    }

    public async close(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.ws.onclose = () => {
                this.callEventListeners('close')
                resolve(true)
            }

            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout)
            }

            if (this.ws.readyState === WebSocket.CLOSED) {
                resolve(false)
                return
            } else if (this.ws.readyState === WebSocket.CLOSING) {
                return
            }

            this.ws.close()
        })
    }

    private onWsOpen() {
        this.callEventListeners('open')
    }

    private onWSError(error: Event) {
        this.callEventListeners('error', error)
    }

    private onWsClose() {
        this.callEventListeners('close')
        if (!this.options.reconnect) return

        this.reconnectTimeout = setTimeout(() => {
            this.open()
        }, this.options.reconnectDelay)
    }

    private onWsMessage(event: MessageEvent) {
        this.callEventListeners('message', event)
    }

    private callEventListeners<E extends WSClientEvent>(
        event: E,
        ...args: WSClientEventMap[E] extends void ? [] : [eventData: WSClientEventMap[E]]
    ) {
        for (const listener of this.eventListeners[event]) {
            listener(...(args as [WSClientEventMap[E]]))
        }
    }

    public addEventListener<E extends WSClientEvent>(event: E, callback: (event: WSClientEventMap[E]) => void) {
        this.eventListeners[event].push(callback)
    }

    public removeEventListener<E extends WSClientEvent>(event: E, callback: WSClientEventListener<E>) {
        const index = this.eventListeners[event].indexOf(callback)
        if (index === -1) return
        this.eventListeners[event].splice(index, 1)
    }

    public getReadyState(): number {
        return this.ws.readyState
    }
}
