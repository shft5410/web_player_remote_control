import React from 'react'

import '@/popup/components/RippleBackground.scss'

const ANIMATION_DURATION = 1500 // milliseconds

export default function RippleBackground() {
    const rippleBackgroundRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        let isRunning: boolean = true

        function animateRipples(timestamp: number) {
            if (!isRunning) {
                return
            }

            const animationProgress = (timestamp % ANIMATION_DURATION) / ANIMATION_DURATION

            rippleBackgroundRef.current!.style.setProperty('--ripple-gradient-offset', animationProgress * 20 + 'px')

            requestAnimationFrame(animateRipples)
        }
        requestAnimationFrame(animateRipples)

        return () => {
            isRunning = false
        }
    }, [])

    return <div ref={rippleBackgroundRef} className="ripple-background" />
}
