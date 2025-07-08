import { type WSConnectionStatus } from '@/types/webSocketConnection'
import { type PlayerCommandMessage, isPlayerCommandMessage } from '@/types/messaging'
import { WebSocketClient } from '@/contentScripts/WebSocketClient'

type TransitionState<T> = {
    value: T
    pending: T | null
    isTransitioning: boolean
}

/**
 * Handles the WebSocket connection to receive player commands.
 */
export class WSConnectionHandler {
    private state = {
        isEnabled: { value: false, pending: null, isTransitioning: false } as TransitionState<boolean>,
        serverUrl: { value: '', pending: null, isTransitioning: false } as TransitionState<string>,
    }
    private messageCallback: (command: PlayerCommandMessage) => void
    private connectionStatusChangeCallback?: (status: WSConnectionStatus) => void

    private ws: WebSocketClient | null = null

    /**
     * Create a new WSConnectionHandler instance.
     *
     * @param isEnabled The initial enabled state of the WebSocket connection.
     * @param serverUrl The initial WebSocket server URL to connect to.
     * @param messageCallback Callback function to handle incoming player command messages.
     * @param connectionStatusChangeCallback Optional callback function to handle connection status changes.
     */
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
            // If the connection is enabled, connect to the WebSocket server
            this.connect()
        }
    }

    /**
     * Set the enabled state of the WebSocket connection.
     *
     * @param enabled Whether the WebSocket connection should be enabled or disabled.
     */
    public async setIsEnabled(enabled: boolean) {
        if (this.state.isEnabled.isTransitioning) {
            // If a transition is already in progress, queue the new state
            this.state.isEnabled.pending = enabled
            return
        }

        // Set and apply the new enabled state
        const prevState = this.state.isEnabled.value
        this.state.isEnabled.value = enabled
        if (enabled && !prevState) {
            this.connect()
        } else if (!enabled && prevState) {
            await this.disconnect()
        }

        if (this.state.isEnabled.pending !== null) {
            // If there is a pending state, apply it after the current transition
            this.setIsEnabled(this.state.isEnabled.pending)
            this.state.isEnabled.pending = null
        }
    }

    /**
     * Set the WebSocket server URL.
     *
     * @param serverUrl The new WebSocket server URL to connect to.
     */
    public async setServerUrl(serverUrl: string) {
        if (this.state.serverUrl.isTransitioning) {
            // If a transition is already in progress, queue the new URL
            this.state.serverUrl.pending = serverUrl
            return
        }

        // Set and apply the new server URL
        this.state.serverUrl.value = serverUrl
        if (this.state.isEnabled.value) {
            await this.disconnect()
            this.connect()
        }

        if (this.state.serverUrl.pending !== null) {
            // If there is a pending URL, apply it after the current transition
            this.setServerUrl(this.state.serverUrl.pending)
            this.state.serverUrl.pending = null
        }
    }

    /**
     * Connect to the WebSocket server.
     */
    private connect() {
        if (this.ws) {
            console.warn('Already connected to WebSocket server')
            return
        }

        // Create a new WebSocketClient instance
        this.ws = new WebSocketClient(this.state.serverUrl.value, {
            reconnect: true,
            reconnectDelay: 10000,
        })

        // Set up event listeners for the WebSocket connection
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

        // Call the connection status change callback
        this.callConnectionStatusChangeCallback()
    }

    /**
     * Disconnect from the WebSocket server.
     *
     * @returns A promise that resolves when the WebSocket connection is closed.
     */
    private async disconnect() {
        if (!this.ws) {
            console.warn('Not connected to WebSocket server')
            return
        }

        // Close the connection
        const isConnectedOnClose = await this.ws.close()
        this.ws = null
        if (!isConnectedOnClose) {
            // If the connection was not open, the onclose callback won't be called,
            // so the status change callback must be called manually
            this.callConnectionStatusChangeCallback()
        }
        console.log('Disconnected from WebSocket server')
    }

    /**
     * Handle incoming WebSocket messages.
     */
    private handleMessage(event: MessageEvent) {
        let data: unknown

        try {
            // Try to parse the incoming message as JSON
            data = JSON.parse(event.data)
        } catch (_) {
            console.error('Unable to parse message:', event.data)
            return
        }

        if (isPlayerCommandMessage(data)) {
            // If the message is a valid PlayerCommandMessage, call the message callback
            this.messageCallback(data)
        } else {
            console.warn('Received unknown command:', data)
        }
    }

    /**
     * Get the current connection status of the WebSocket.
     *
     * The status can be:
     * - `disconnected` if the connection is disabled
     * - `connected` if the WebSocket connection is open
     * - `connecting` if the WebSocket is enabled but not currently connected
     *
     * @returns The current connection status.
     */
    public getConnectionStatus(): WSConnectionStatus {
        if (!this.state.isEnabled.value) {
            return 'disconnected'
        } else if (this.ws?.getReadyState() === WebSocketClient.READY_STATE.OPEN) {
            return 'connected'
        } else {
            return 'connecting'
        }
    }

    /**
     * Call the connection status change callback if it is set.
     */
    private callConnectionStatusChangeCallback() {
        this.connectionStatusChangeCallback?.(this.getConnectionStatus())
    }
}
