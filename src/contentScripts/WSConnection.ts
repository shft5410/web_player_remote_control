import { type WSCommand, type WSConnectionStatus, isWSCommand } from '@/types/websocket'

export class WSConnection {
    private ws: WebSocket | null = null
    private isEnabled: boolean
    private serverUrl: string
    private messageCallback: (command: WSCommand) => void
    private connectionStatusChangeCallback?: (status: WSConnectionStatus) => void

    private reconnectTimeout: NodeJS.Timeout | null = null

    constructor(
        isEnabled: boolean,
        serverUrl: string,
        messageCallback: (command: WSCommand) => void,
        connectionStatusChangeCallback?: (status: WSConnectionStatus) => void
    ) {
        this.isEnabled = isEnabled
        this.serverUrl = serverUrl
        this.messageCallback = messageCallback
        this.connectionStatusChangeCallback = connectionStatusChangeCallback

        if (this.isEnabled) {
            this.connect()
        }
    }

    public setIsEnabled(enabled: boolean) {
        if (enabled && !this.isEnabled) {
            this.connect()
        } else if (!enabled && this.isEnabled) {
            this.disconnect()
        }
    }

    public setServerUrl(url: string) {
        if (this.serverUrl === url) return
        this.serverUrl = url
        if (this.isEnabled) {
            this.disconnect()
            this.connect()
        }
    }

    public getConnectionStatus(): WSConnectionStatus {
        if (!this.isEnabled) {
            return 'disconnected'
        } else if (this.ws?.readyState === WebSocket.OPEN) {
            return 'connected'
        } else {
            return 'connecting'
        }
    }

    private connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
            console.warn('Already connected to WebSocket server')
            return
        }
        this.isEnabled = true
        this.callConnectionStatusChangeCallback()

        this.ws = new WebSocket(this.serverUrl)

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server')
            this.callConnectionStatusChangeCallback()
        }

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        this.ws.onclose = () => {
            console.log('WebSocket connection closed')
            this.ws = null
            this.callConnectionStatusChangeCallback()

            if (this.isEnabled) {
                this.reconnectTimeout = setTimeout(() => {
                    console.log('Reconnecting to WebSocket server...')
                    this.connect()
                }, 10000)
            }
        }

        this.ws.onmessage = this.handleMessage.bind(this)
    }

    private disconnect() {
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

    private callConnectionStatusChangeCallback() {
        this.connectionStatusChangeCallback?.(this.getConnectionStatus())
    }
}
