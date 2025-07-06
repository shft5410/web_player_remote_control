import { type Browser, defineContentScript, storage } from '#imports'

import { type WSConnectionStatus } from '@/types/webSocketConnection'
import {
    type PlayerCommandMessage,
    type RequestInitialDataMessage,
    type ConnectionStatusMessage,
} from '@/types/messaging'
import { WSConnectionHandler } from '@/contentScripts/WSConnectionHandler'
import { PopupMessagingHandler } from '@/contentScripts/PopupMessagingHandler'

export default defineContentScript({
    matches: ['https://music.youtube.com/*', 'https://www.audible.de/webplayer?*'],
    async main() {
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

        const popupMessagingHandler = new PopupMessagingHandler(handlePopupMessage)
        const wsConnectionHandler = new WSConnectionHandler(
            isEnabled,
            serverUrl,
            handlePlayerCommand,
            handleWSConnectionStatusChange
        )

        function handlePlayerCommand(command: PlayerCommandMessage) {
            window.postMessage(command, pageOrigin)
        }

        function handleWSConnectionStatusChange(status: WSConnectionStatus) {
            popupMessagingHandler.sendMessage<ConnectionStatusMessage>({
                type: 'connection-status',
                payload: status,
            })
        }

        function handlePopupMessage(
            _message: RequestInitialDataMessage,
            _sender: Browser.runtime.MessageSender,
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
    },
})
