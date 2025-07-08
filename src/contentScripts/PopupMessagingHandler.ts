import { type Browser, browser } from '#imports'

import { type RequestInitialDataMessage, isRequestInitialDataMessage } from '@/types/messaging'

/**
 * Handles message communication with the popup.
 * Messages are validated and passed to the provided callback.
 * Messages can be sent to the popup using the `sendMessage` method.
 */
export class PopupMessagingHandler {
    private messageCallback: (
        message: RequestInitialDataMessage,
        sender: Browser.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) => void

    /**
     * Create a new PopupMessagingHandler instance.
     *
     * @param messageCallback Callback to handle incoming messages.
     */
    constructor(
        messageCallback: (
            message: RequestInitialDataMessage,
            sender: Browser.runtime.MessageSender,
            sendResponse: (response?: any) => void
        ) => void
    ) {
        this.messageCallback = messageCallback

        // Listen for messages from the popup
        browser.runtime.onMessage.addListener(this.handleMessage.bind(this))
    }

    /**
     * Send a message to the popup.
     *
     * @param message Message to send to the popup.
     * @returns A promise that resolves when the message is sent.
     */
    public async sendMessage<T>(message: T) {
        // Errors are ignored to prevent issues if the popup is closed and therefore cannot receive messages
        return browser.runtime.sendMessage(message).catch(() => {})
    }

    /**
     * Handle incoming messages from the popup.
     *
     * @param message The message received from the popup.
     * @param sender The sender of the message.
     * @param sendResponse Function to call to send a response back to the popup.
     */
    private handleMessage(
        message: unknown,
        sender: Browser.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) {
        if (isRequestInitialDataMessage(message)) {
            this.messageCallback(message, sender, sendResponse)
        } else {
            console.warn('Received unknown message:', message)
        }
    }
}
