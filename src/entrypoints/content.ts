import { type WSCommand } from '@/types/websocket'
import { WSConnection } from '@/contentScripts/WSConnection'
import * as YTMusic from '@/contentScripts/ytmusic'

export default defineContentScript({
    matches: ['https://music.youtube.com/*'],
    main() {
        new WSConnection(true, handleCommand)

        function handleCommand(command: WSCommand) {
            if (command.type === 'toggle-play-pause') {
                YTMusic.togglePlayPause()
            } else if (command.type === 'previous-track') {
                YTMusic.previousTrack()
            } else if (command.type === 'next-track') {
                YTMusic.nextTrack()
            } else if (command.type === 'set-volume') {
                const volume = command.payload
                if (volume >= 0 && volume <= 1) {
                    YTMusic.setVolume(volume)
                } else {
                    console.warn('Invalid volume value received:', volume)
                }
            }
        }
    },
})
