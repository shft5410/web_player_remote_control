import React from 'react'
import { browser } from '#imports'

import '@/popup/App.scss'
import RippleBackground from '@/popup/components/RippleBackground'
import StatusButton from '@/popup/components/StatusButton'
import ToggleSetting from '@/popup/components/ToggleSetting'
import TextSetting from '@/popup/components/TextSetting'
import useStorageSyncedState from './hooks/useStorageSyncedState'
import useActiveTab from '@/popup/hooks/useActiveTab'

import { type RequestInitialDataMessage, isInitialDataMessage, isConnectionStatusMessage } from '@/types/messaging'
import { type WSConnectionStatus } from '@/types/webSocketConnection'
import DisconnectedIcon from '@/popup/assets/icons/disconnected.svg?react'
import ConnectedIcon from '@/popup/assets/icons/connected.svg?react'
import EllipsisHorizontalIcon from '@/popup/assets/icons/ellipsisHorizontal.svg?react'

/**
 * Popup application for controlling the WebSocket connection.
 */
function App() {
    const activeTab = useActiveTab(['id'])
    const [isConnectionEnabled, setIsConnectionEnabled] = useStorageSyncedState<boolean>(
        false,
        'connection-enabled',
        (value): value is boolean => typeof value === 'boolean'
    )
    const [connectionStatusIndex, setConnectionStatusIndex] = React.useState<number>(0)

    /**
     * Effect to handle messages from the content script and request initial data.
     *
     * The effect is rerun when the id of the active tab changes.
     * It registers a message listener, which handles incoming messages from the content script.
     * The cleanup function removes the message listener.
     */
    React.useEffect(() => {
        /**
         * Update the connection status index based on the current WebSocket connection status.
         *
         * @param status The current WebSocket connection status.
         */
        function updateConnectionStatus(status: WSConnectionStatus) {
            const statusIndexMap: Record<string, number> = {
                disconnected: 0,
                connecting: 1,
                connected: 2,
            }
            setConnectionStatusIndex(statusIndexMap[status])
        }

        /**
         * Handle messages received from the content script.
         *
         * @param message The message received from the content script.
         */
        function handleMessage(message: unknown) {
            if (isConnectionStatusMessage(message)) {
                updateConnectionStatus(message.payload)
            } else {
                console.warn('Received unknown message:', message)
            }
        }

        if (activeTab?.id) {
            // If the id of the active tab is available, request initial data from the content script
            browser.tabs
                .sendMessage<RequestInitialDataMessage, unknown>(activeTab.id, {
                    type: 'request-initial-data',
                })
                .then((response) => {
                    if (!isInitialDataMessage(response)) {
                        console.warn('Invalid initial data response:', response)
                        return
                    }
                    updateConnectionStatus(response.payload.connectionStatus)
                })
                .catch(() => {})

            // Listen for messages from the content script
            browser.runtime.onMessage.addListener(handleMessage)
        }

        return () => {
            // Cleanup: remove the message listener
            browser.runtime.onMessage.removeListener(handleMessage)
        }
    }, [activeTab?.id])

    /**
     * Toggle the enabled state of the WebSocket connection.
     */
    function handleToggleConnection() {
        setIsConnectionEnabled((prev) => !prev)
    }

    return (
        <div className="app">
            <RippleBackground spreadFactors={[0, 0.6, 1]} spreadFactorIndex={connectionStatusIndex} />
            <StatusButton
                label={isConnectionEnabled ? 'Disconnect' : 'Connect'}
                onClick={handleToggleConnection}
                statusVariants={[
                    {
                        icon: DisconnectedIcon,
                        text: 'Disconnected',
                    },
                    {
                        icon: EllipsisHorizontalIcon,
                        text: 'Connecting',
                    },
                    {
                        icon: ConnectedIcon,
                        text: 'Connected',
                    },
                ]}
                variantIndex={connectionStatusIndex}
            />
            <ToggleSetting settingKey="remember-connection" label="Remember Connection" />
            <TextSetting settingKey="ws-server" label="WebSocket-Server" placeholder="URL" />
        </div>
    )
}

export default App
