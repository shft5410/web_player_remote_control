import { defineContentScript } from '#imports'

import { type WSCommand } from '@/types/webSocketConnection'
import bootstrapContentScript from '@/contentScripts/bootstrapContentScript'
import * as YTMusic from '@/contentScripts/ytmusic'

export default defineContentScript({
    matches: ['https://music.youtube.com/*'],
    main() {
        bootstrapContentScript((command: WSCommand) => {
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
            } else {
                console.warn(`Command ${command.type} is not supported on YouTube Music`)
            }
        })
    },
})
