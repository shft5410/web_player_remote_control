export function togglePlayPause() {
    const playPauseButton = document.querySelector('#play-pause-button.ytmusic-player-bar') as HTMLElement
    if (!playPauseButton) {
        console.error('Play/Pause button not found')
        return
    }

    playPauseButton.click()
}

export function previousTrack() {
    const previousButton = document.querySelector('.previous-button.ytmusic-player-bar') as HTMLElement
    if (!previousButton) {
        console.error('Previous song button not found')
        return
    }

    previousButton.click()
}

export function nextTrack() {
    const nextButton = document.querySelector('.next-button.ytmusic-player-bar') as HTMLElement
    if (!nextButton) {
        console.error('Next song button not found')
        return
    }

    nextButton.click()
}

export function setVolume(volume: number) {
    const sliderBar = document.querySelector('#volume-slider.ytmusic-player-bar #sliderBar') as HTMLElement
    if (!sliderBar) {
        console.error('Volume slider not found')
        return
    }

    const rect = sliderBar.getBoundingClientRect()
    const x = rect.left + rect.width * volume
    const y = rect.top + rect.height / 2

    const downEvent = new CustomEvent('down', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { x, y },
    })

    const upEvent = new CustomEvent('up', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { x, y },
    })

    sliderBar.dispatchEvent(downEvent)
    sliderBar.dispatchEvent(upEvent)
}
