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

    /**
     * The main purpose of this content script is to handle the connection to the WebSocket server.
     * It also provides the popup with information about the connection status of the WebSocket and
     * delegates player commands to the content script running in the main world, which executes them.
     * This script is injected into all supported web pages and runs in the isolated world.
     */
    async main() {
        const pageOrigin = window.location.origin

        // Load settings and initialize them if necessary
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

        // Set up the messaging handler to communicate with the popup
        const popupMessagingHandler = new PopupMessagingHandler(handlePopupMessage)
        // Set up the WebSocket connection handler to receive player commands from the server
        const wsConnectionHandler = new WSConnectionHandler(
            isEnabled,
            serverUrl,
            handlePlayerCommand,
            handleWSConnectionStatusChange
        )

        /**
         * Handle player command messages received from the WebSocket server.
         *
         * @param command The player command message received from the WebSocket server.
         */
        function handlePlayerCommand(command: PlayerCommandMessage) {
            window.postMessage(command, pageOrigin)
        }

        /**
         * Handle changes in the WebSocket connection status.
         *
         * @param status The new WebSocket connection status.
         */
        function handleWSConnectionStatusChange(status: WSConnectionStatus) {
            popupMessagingHandler.sendMessage<ConnectionStatusMessage>({
                type: 'connection-status',
                payload: status,
            })
        }

        /**
         * Handle messages from the popup.
         *
         * @param _message The message received from the popup.
         * @param _sender The sender of the message.
         * @param sendResponse The function to call to send a response back to the popup.
         */
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

        // Watch for changes of the settings in the storage
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
