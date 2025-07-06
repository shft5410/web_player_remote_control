import { type Browser, browser } from '#imports'

import { type RequestInitialDataMessage, isRequestInitialDataMessage } from '@/types/messaging'

export class PopupMessagingHandler {
    private messageCallback: (
        message: RequestInitialDataMessage,
        sender: Browser.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) => void

    constructor(
        messageCallback: (
            message: RequestInitialDataMessage,
            sender: Browser.runtime.MessageSender,
            sendResponse: (response?: any) => void
        ) => void
    ) {
        this.messageCallback = messageCallback

        browser.runtime.onMessage.addListener(this.handleMessage.bind(this))
    }

    public async sendMessage<T>(message: T) {
        return browser.runtime.sendMessage(message).catch(() => {})
    }

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
