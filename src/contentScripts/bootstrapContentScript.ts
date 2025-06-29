import { type Browser, storage } from '#imports'

import { type WSCommand, type WSConnectionStatus } from '@/types/webSocketConnection'
import { type RequestInitialDataMessage, type ConnectionStatusMessage } from '@/types/messaging'
import { WSConnectionHandler } from '@/contentScripts/WSConnectionHandler'
import { MessagingHandler } from '@/contentScripts/MessagingHandler'

export default async function bootstrapContentScript(handlePlayerCommand: (command: WSCommand) => void) {
    const messagingHandler = new MessagingHandler(handleExtMessage)

    const pageOrigin = window.location.origin

    let [rememberConnection, isEnabled, serverUrl] = await Promise.all([
        storage.getItem<boolean>(`local:page:${pageOrigin}/remember-connection`),
        storage.getItem<boolean>(`local:page:${pageOrigin}/connection-enabled`),
        storage.getItem<string>(`local:page:${pageOrigin}/ws-server`),
    ])
    if (rememberConnection === undefined || rememberConnection === null) {
        rememberConnection = false
        storage.setItem(`local:page:${pageOrigin}/remember-connection`, rememberConnection)
    }
    if (isEnabled === undefined || isEnabled === null || (!rememberConnection && isEnabled)) {
        isEnabled = false
        storage.setItem(`local:page:${pageOrigin}/connection-enabled`, isEnabled)
    }
    if (serverUrl === undefined || serverUrl === null) {
        serverUrl = 'ws://localhost:9772'
        storage.setItem(`local:page:${pageOrigin}/ws-server`, serverUrl)
    }

    const wsConnectionHandler = new WSConnectionHandler(
        isEnabled,
        serverUrl,
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

    storage.watch<boolean>(`local:page:${pageOrigin}/connection-enabled`, (newValue, oldValue) => {
        if (newValue === oldValue) return
        if (typeof newValue === 'boolean') {
            wsConnectionHandler.setIsEnabled(newValue)
        }
    })

    storage.watch<string>(`local:page:${pageOrigin}/ws-server`, (newValue, oldValue) => {
        if (newValue === oldValue) return
        if (typeof newValue === 'string') {
            wsConnectionHandler.setServerUrl(newValue)
        }
    })
}
