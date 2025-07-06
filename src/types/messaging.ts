import { type WSConnectionStatus, WS_CONNECTION_STATUSES } from '@/types/webSocketConnection'

type BaseMessage<T, P = undefined> = P extends undefined ? { type: T } : { type: T; payload: P }

// Popup messages
export type RequestInitialDataMessage = BaseMessage<'request-initial-data'>
export type InitialDataMessage = BaseMessage<'initial-data', { connectionStatus: WSConnectionStatus }>
export type ConnectionStatusMessage = BaseMessage<'connection-status', WSConnectionStatus>

export function isRequestInitialDataMessage(obj: any): obj is RequestInitialDataMessage {
    return typeof obj === 'object' && obj.type === 'request-initial-data'
}

export function isInitialDataMessage(obj: any): obj is InitialDataMessage {
    return (
        typeof obj === 'object' &&
        obj.type === 'initial-data' &&
        typeof obj.payload === 'object' &&
        WS_CONNECTION_STATUSES.includes(obj.payload.connectionStatus)
    )
}

export function isConnectionStatusMessage(obj: any): obj is ConnectionStatusMessage {
    return typeof obj === 'object' && obj.type === 'connection-status' && WS_CONNECTION_STATUSES.includes(obj.payload)
}

// Player command messages
export type TogglePlayPauseCommandMessage = BaseMessage<'toggle-play-pause'>
export type PreviousTrackCommandMessage = BaseMessage<'previous-track'>
export type NextTrackCommandMessage = BaseMessage<'next-track'>
export type SetVolumeCommandMessage = BaseMessage<'set-volume', number>
export type FastRewindCommandMessage = BaseMessage<'fast-rewind', number>
export type FastForwardCommandMessage = BaseMessage<'fast-forward', number>

export type PlayerCommandMessage =
    | TogglePlayPauseCommandMessage
    | PreviousTrackCommandMessage
    | NextTrackCommandMessage
    | SetVolumeCommandMessage
    | FastRewindCommandMessage
    | FastForwardCommandMessage

export function isPlayerCommandMessage(obj: any): obj is PlayerCommandMessage {
    return (
        typeof obj === 'object' &&
        (obj.type === 'toggle-play-pause' ||
            obj.type === 'previous-track' ||
            obj.type === 'next-track' ||
            (obj.type === 'set-volume' && typeof obj.payload === 'number') ||
            (obj.type === 'fast-rewind' && typeof obj.payload === 'number') ||
            (obj.type === 'fast-forward' && typeof obj.payload === 'number'))
    )
}
