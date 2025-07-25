import { defineContentScript } from '#imports'

import { type PlayerCommandMessage } from '@/types/messaging'
import { MainContentMessagingHandler } from '@/contentScripts/MainContentMessagingHandler'
import * as YTMusic from '@/contentScripts/ytmusic'

export default defineContentScript({
    matches: ['https://music.youtube.com/*'],
    world: 'MAIN',

    /**
     * This content script calls the page specific functions to execute player commands on YouTube Music.
     * It receives the player commands from the main content script via the messaging channel of the window object.
     * This script is only injected into the YouTube Music web page and runs in the main world.
     */
    main() {
        // Set up the messaging handler to receive player commands from the main content script
        new MainContentMessagingHandler((command: PlayerCommandMessage) => {
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
