import { type PlayerCommandMessage, isPlayerCommandMessage } from '@/types/messaging'

export class MainContentMessagingHandler {
    private messageCallback: (message: PlayerCommandMessage) => void

    constructor(messageCallback: (message: PlayerCommandMessage) => void) {
        this.messageCallback = messageCallback

        window.addEventListener('message', this.handleMessage.bind(this))
    }

    private handleMessage(event: MessageEvent<unknown>) {
        if (event.origin !== window.location.origin) return
        if (isPlayerCommandMessage(event.data)) {
            this.messageCallback(event.data)
        } else {
            console.warn('Received unknown message:', event.data)
        }
    }
}
