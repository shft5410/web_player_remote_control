export function togglePlayPause() {
    const playPauseButton = document.querySelector('#adbl-cloud-player-controls #adbl-cp-play-btn') as HTMLElement
    if (!playPauseButton) {
        console.error('Play/Pause button not found')
        return
    }

    playPauseButton.click()
}

export function previousTrack() {
    const previousButton = document.querySelector(
        '#adbl-cloud-player-controls #adbl-cloud-player-prev button'
    ) as HTMLElement
    if (!previousButton) {
        console.error('Previous song button not found')
        return
    }

    previousButton.click()
}

export function nextTrack() {
    const nextButton = document.querySelector(
        '#adbl-cloud-player-controls #adbl-cloud-player-next button'
    ) as HTMLElement
    if (!nextButton) {
        console.error('Next song button not found')
        return
    }

    nextButton.click()
}

export function fastRewind30s() {
    const fastRewindButton = document.querySelector('#adbl-cloud-player-controls button.adblFastRewind') as HTMLElement
    if (!fastRewindButton) {
        console.error('Fast rewind button not found')
        return
    }

    fastRewindButton.click()
}

export function fastForward30s() {
    const fastForwardButton = document.querySelector(
        '#adbl-cloud-player-controls button.adblFastForward'
    ) as HTMLElement
    if (!fastForwardButton) {
        console.error('Fast forward button not found')
        return
    }

    fastForwardButton.click()
}
