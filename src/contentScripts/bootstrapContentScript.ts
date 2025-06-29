import { type Browser } from '#imports'

import { type WSCommand, type WSConnectionStatus } from '@/types/websocket'
import { type RequestInitialDataMessage, type ConnectionStatusMessage } from '@/types/messaging'
import { WSConnectionHandler } from '@/contentScripts/WSConnectionHandler'
import { MessagingHandler } from '@/contentScripts/MessagingHandler'

export default function bootstrapContentScript(handlePlayerCommand: (command: WSCommand) => void) {
    const messagingHandler = new MessagingHandler(handleExtMessage)
    const wsConnectionHandler = new WSConnectionHandler(
        true,
        'ws://localhost:8080',
        handlePlayerCommand,
        handleWSConnectionStatusChange
    )

    function handleWSConnectionStatusChange(status: WSConnectionStatus) {
        messagingHandler.sendMessage<ConnectionStatusMessage>({
            type: 'connection-status',
            payload: status,
        })
    }

    function handleExtMessage(
        message: RequestInitialDataMessage,
        sender: Browser.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) {
        sendResponse({
            type: 'initial-data',
            payload: {
                connectionStatus: wsConnectionHandler.getConnectionStatus(),
            },
        })
    }
}
