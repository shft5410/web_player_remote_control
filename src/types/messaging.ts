import { type WSConnectionStatus, WS_CONNECTION_STATUSES } from '@/types/webSocketConnection'

/**
 * Base message type for all messages sent between the popup and the player as well as via the WebSocket connection.
 */
type BaseMessage<T, P = undefined> = P extends undefined ? { type: T } : { type: T; payload: P }

// Popup messages
export type RequestInitialDataMessage = BaseMessage<'request-initial-data'>
export type InitialDataMessage = BaseMessage<'initial-data', { connectionStatus: WSConnectionStatus }>
export type ConnectionStatusMessage = BaseMessage<'connection-status', WSConnectionStatus>

/**
 * Check if an object is a RequestInitialDataMessage.
 *
 * @param obj The object to check.
 * @returns True if the object is a RequestInitialDataMessage, false otherwise.
 */
export function isRequestInitialDataMessage(obj: any): obj is RequestInitialDataMessage {
    return typeof obj === 'object' && obj.type === 'request-initial-data'
}

/**
 * Check if an object is an InitialDataMessage.
 *
 * @param obj The object to check.
 * @returns True if the object is an InitialDataMessage, false otherwise.
 */
export function isInitialDataMessage(obj: any): obj is InitialDataMessage {
    return (
        typeof obj === 'object' &&
        obj.type === 'initial-data' &&
        typeof obj.payload === 'object' &&
        WS_CONNECTION_STATUSES.includes(obj.payload.connectionStatus)
    )
}

/**
 * Check if an object is a ConnectionStatusMessage.
 *
 * @param obj The object to check.
 * @returns True if the object is a ConnectionStatusMessage, false otherwise.
 */
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

/**
 * Union type for all player command messages.
 */
export type PlayerCommandMessage =
    | TogglePlayPauseCommandMessage
    | PreviousTrackCommandMessage
    | NextTrackCommandMessage
    | SetVolumeCommandMessage
    | FastRewindCommandMessage
    | FastForwardCommandMessage

/**
 * Check if an object is a PlayerCommandMessage.
 *
 * @param obj The object to check.
 * @returns True if the object is a PlayerCommandMessage, false otherwise.
 */
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
