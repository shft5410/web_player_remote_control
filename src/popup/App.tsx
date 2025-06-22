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
import { type WSConnectionStatus } from '@/types/websocket'
import DisconnectedIcon from '@/popup/assets/icons/disconnected.svg?react'
import ConnectedIcon from '@/popup/assets/icons/connected.svg?react'
import EllipsisHorizontalIcon from '@/popup/assets/icons/ellipsisHorizontal.svg?react'

function App() {
    const activeTab = useActiveTab()
    const [isConnectionEnabled, setIsConnectionEnabled] = useStorageSyncedState<boolean>(
        false,
        'connection-enabled',
        (value): value is boolean => typeof value === 'boolean'
    )
    const [connectionStatusIndex, setConnectionStatusIndex] = React.useState<number>(0)

    React.useEffect(() => {
        function updateConnectionStatus(status: WSConnectionStatus) {
            const statusIndexMap: Record<string, number> = {
                disconnected: 0,
                connecting: 1,
                connected: 2,
            }
            setConnectionStatusIndex(statusIndexMap[status])
        }

        function handleMessage(message: unknown) {
            if (isConnectionStatusMessage(message)) {
                updateConnectionStatus(message.payload)
            } else {
                console.warn('Received unknown message:', message)
            }
        }

        if (activeTab && activeTab.id) {
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
            browser.runtime.onMessage.addListener(handleMessage)
        }

        return () => {
            browser.runtime.onMessage.removeListener(handleMessage)
        }
    }, [activeTab])

    function handleToggleConnection() {
        setIsConnectionEnabled((prev) => !prev)
    }

    return (
        <div className="app">
            <RippleBackground isEnabled={isConnectionEnabled} />
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
