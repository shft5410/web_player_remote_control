import { type PlayerCommandMessage, isPlayerCommandMessage } from '@/types/messaging'

/**
 * Handles messages from the main content script.
 * Messages are validated and passed to the provided callback.
 */
export class MainContentMessagingHandler {
    private messageCallback: (message: PlayerCommandMessage) => void

    /**
     * Create a new MainContentMessagingHandler instance.
     *
     * @param messageCallback Callback to handle incoming messages.
     */
    constructor(messageCallback: (message: PlayerCommandMessage) => void) {
        this.messageCallback = messageCallback

        window.addEventListener('message', this.handleMessage.bind(this))
    }

    /**
     * Handle incoming messages from the main content script.
     *
     * @param event The message event from the window.
     */
    private handleMessage(event: MessageEvent<unknown>) {
        if (event.origin !== window.location.origin) return
        if (isPlayerCommandMessage(event.data)) {
            this.messageCallback(event.data)
        } else {
            console.warn('Received unknown message:', event.data)
        }
    }
}
