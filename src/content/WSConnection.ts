import { type WSCommand, isWSCommand } from '@/types/websocket'

export class WSConnection {
    private ws: WebSocket | null = null
    private isEnabled: boolean = true
    private messageCallback: (command: WSCommand) => void

    private reconnectTimeout: NodeJS.Timeout | null = null

    constructor(isEnabled: boolean, messageCallback: (command: WSCommand) => void) {
        this.isEnabled = isEnabled
        this.messageCallback = messageCallback

        if (isEnabled) {
            this.connect()
        }
    }

    public connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
            console.warn('Already connected to WebSocket server')
            return
        }
        this.isEnabled = true

        this.ws = new WebSocket('ws://localhost:8080')

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server')
        }

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        this.ws.onclose = () => {
            console.log('WebSocket connection closed')
            this.ws = null

            if (this.isEnabled) {
                this.reconnectTimeout = setTimeout(() => {
                    console.log('Reconnecting to WebSocket server...')
                    this.connect()
                }, 1000)
            }
        }

        this.ws.onmessage = this.handleMessage.bind(this)
    }

    public disconnect() {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            console.warn('Not connected to WebSocket server')
            return
        }
        this.isEnabled = false
        clearTimeout(this.reconnectTimeout as NodeJS.Timeout)

        this.ws.close()
        console.log('Disconnected from WebSocket server')
    }

    private handleMessage(event: MessageEvent) {
        let data: unknown

        try {
            data = JSON.parse(event.data)
        } catch (_) {
            console.error('Unable to parse message:', event.data)
            return
        }

        if (isWSCommand(data)) {
            this.messageCallback(data)
        } else {
            console.warn('Received unknown command:', data)
        }
    }
}
