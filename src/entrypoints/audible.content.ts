import { defineContentScript } from '#imports'

import { type PlayerCommandMessage } from '@/types/messaging'
import { MainContentMessagingHandler } from '@/contentScripts/MainContentMessagingHandler'
import * as Audible from '@/contentScripts/audible'

export default defineContentScript({
    matches: ['https://www.audible.de/webplayer?*'],
    world: 'MAIN',
    main() {
        new MainContentMessagingHandler((command: PlayerCommandMessage) => {
            if (command.type === 'toggle-play-pause') {
                Audible.togglePlayPause()
            } else if (command.type === 'previous-track') {
                Audible.previousTrack()
            } else if (command.type === 'next-track') {
                Audible.nextTrack()
            } else if (command.type === 'fast-rewind') {
                if (command.payload === 30) {
                    Audible.fastRewind30s()
                } else {
                    console.warn('Unsupported fast rewind duration. Only 30 seconds is supported')
                }
            } else if (command.type === 'fast-forward') {
                if (command.payload === 30) {
                    Audible.fastForward30s()
                } else {
                    console.warn('Unsupported fast forward duration. Only 30 seconds is supported')
                }
            } else {
                console.warn(`Command ${command.type} is not supported on Audible`)
            }
        })
    },
})
