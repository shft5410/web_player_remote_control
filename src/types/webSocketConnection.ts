type BaseWSCommand<T, P = undefined> = P extends undefined ? { type: T } : { type: T; payload: P }

export type TogglePlayPauseCommand = BaseWSCommand<'toggle-play-pause'>
export type PreviousTrackCommand = BaseWSCommand<'previous-track'>
export type NextTrackCommand = BaseWSCommand<'next-track'>
export type SetVolumeCommand = BaseWSCommand<'set-volume', number>
export type FastRewindCommand = BaseWSCommand<'fast-rewind', number>
export type FastForwardCommand = BaseWSCommand<'fast-forward', number>

export type WSCommand =
    | TogglePlayPauseCommand
    | PreviousTrackCommand
    | NextTrackCommand
    | SetVolumeCommand
    | FastRewindCommand
    | FastForwardCommand

export type WSConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export function isWSCommand(obj: any): obj is WSCommand {
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
