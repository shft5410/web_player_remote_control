import { type WSConnectionStatus } from '@/types/webSocketConnection'
import { type PlayerCommandMessage, isPlayerCommandMessage } from '@/types/messaging'
import { WebSocketClient } from '@/contentScripts/WebSocketClient'

type TransitionState<T> = {
    value: T
    pending: T | null
    isTransitioning: boolean
}

export class WSConnectionHandler {
    private state = {
        isEnabled: { value: false, pending: null, isTransitioning: false } as TransitionState<boolean>,
        serverUrl: { value: '', pending: null, isTransitioning: false } as TransitionState<string>,
    }
    private messageCallback: (command: PlayerCommandMessage) => void
    private connectionStatusChangeCallback?: (status: WSConnectionStatus) => void

    private ws: WebSocketClient | null = null

    constructor(
        isEnabled: boolean,
        serverUrl: string,
        messageCallback: (command: PlayerCommandMessage) => void,
        connectionStatusChangeCallback?: (status: WSConnectionStatus) => void
    ) {
        this.state.isEnabled.value = isEnabled
        this.state.serverUrl.value = serverUrl
        this.messageCallback = messageCallback
        this.connectionStatusChangeCallback = connectionStatusChangeCallback

        if (isEnabled) {
            this.connect()
        }
    }

    public async setIsEnabled(enabled: boolean) {
        if (this.state.isEnabled.isTransitioning) {
            this.state.isEnabled.pending = enabled
            return
        }

        const prevState = this.state.isEnabled.value
        this.state.isEnabled.value = enabled
        if (enabled && !prevState) {
            this.connect()
        } else if (!enabled && prevState) {
            await this.disconnect()
        }

        if (this.state.isEnabled.pending !== null) {
            this.setIsEnabled(this.state.isEnabled.pending)
            this.state.isEnabled.pending = null
        }
    }

    public async setServerUrl(serverUrl: string) {
        if (this.state.serverUrl.isTransitioning) {
            this.state.serverUrl.pending = serverUrl
            return
        }

        this.state.serverUrl.value = serverUrl
        if (this.state.isEnabled.value) {
            await this.disconnect()
            this.connect()
        }

        if (this.state.serverUrl.pending !== null) {
            this.setServerUrl(this.state.serverUrl.pending)
            this.state.serverUrl.pending = null
        }
    }

    private connect() {
        if (this.ws) {
            console.warn('Already connected to WebSocket server')
            return
        }

        this.ws = new WebSocketClient(this.state.serverUrl.value, {
            reconnect: true,
            reconnectDelay: 10000,
        })

        this.ws.addEventListener('open', () => {
            console.log('Connected to WebSocket server')
            this.callConnectionStatusChangeCallback()
        })

        this.ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error)
        })

        this.ws.addEventListener('close', () => {
            console.log('WebSocket connection closed')
            this.callConnectionStatusChangeCallback()
        })

        this.ws.addEventListener('message', this.handleMessage.bind(this))

        this.callConnectionStatusChangeCallback()
    }

    private async disconnect() {
        if (!this.ws) {
            console.warn('Not connected to WebSocket server')
            return
        }

        const isConnectedOnClose = await this.ws.close()
        this.ws = null
        if (!isConnectedOnClose) {
            this.callConnectionStatusChangeCallback()
        }
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

        if (isPlayerCommandMessage(data)) {
            this.messageCallback(data)
        } else {
            console.warn('Received unknown command:', data)
        }
    }

    public getConnectionStatus(): WSConnectionStatus {
        if (!this.state.isEnabled.value) {
            return 'disconnected'
        } else if (this.ws?.getReadyState() === WebSocketClient.READY_STATE.OPEN) {
            return 'connected'
        } else {
            return 'connecting'
        }
    }

    private callConnectionStatusChangeCallback() {
        this.connectionStatusChangeCallback?.(this.getConnectionStatus())
    }
}
