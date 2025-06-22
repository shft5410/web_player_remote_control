import React from 'react'

import '@/popup/components/RippleBackground.scss'

const RIPPLE_ANIMATION_DURATION = 1500 // milliseconds
const BACKGROUND_ANIMATION_DURATION = 500 // milliseconds
const BACKGROUND_MAX_OFFSET = 180 // pixels

type Props = {
    isEnabled?: boolean
}

export default function RippleBackground(props: Props) {
    const rippleBackgroundRef = React.useRef<HTMLDivElement>(null)
    const backgroundGradientOffset = React.useRef(BACKGROUND_MAX_OFFSET)

    React.useEffect(() => {
        let isRunning: boolean = true

        function animateRipples(timestamp: number) {
            if (!isRunning) {
                return
            }

            const animationProgress = (timestamp % RIPPLE_ANIMATION_DURATION) / RIPPLE_ANIMATION_DURATION

            rippleBackgroundRef.current!.style.setProperty('--ripple-gradient-offset', animationProgress * 20 + 'px')

            requestAnimationFrame(animateRipples)
        }
        requestAnimationFrame(animateRipples)

        return () => {
            isRunning = false
        }
    }, [])

    React.useEffect(() => {
        let isRunning: boolean = true
        const animationStartTimestamp = performance.now()
        const animationStartOffset = backgroundGradientOffset.current

        let effectiveAnimationDuration: number
        if (props.isEnabled) {
            effectiveAnimationDuration = BACKGROUND_ANIMATION_DURATION * (animationStartOffset / BACKGROUND_MAX_OFFSET)
        } else {
            effectiveAnimationDuration =
                BACKGROUND_ANIMATION_DURATION * ((BACKGROUND_MAX_OFFSET - animationStartOffset) / BACKGROUND_MAX_OFFSET)
        }

        function animateBackground(timestamp: number) {
            if (!isRunning) {
                return
            }

            const animationProgress = (timestamp - animationStartTimestamp) / effectiveAnimationDuration

            if (props.isEnabled) {
                const offset = Math.max(animationStartOffset - animationProgress * animationStartOffset, 0)
                backgroundGradientOffset.current = offset
                rippleBackgroundRef.current!.style.setProperty('--background-gradient-offset', offset + 'px')
                if (offset > 0) {
                    requestAnimationFrame(animateBackground)
                }
            } else {
                const offset = Math.min(
                    animationStartOffset + animationProgress * (BACKGROUND_MAX_OFFSET - animationStartOffset),
                    BACKGROUND_MAX_OFFSET
                )
                backgroundGradientOffset.current = offset
                rippleBackgroundRef.current!.style.setProperty('--background-gradient-offset', offset + 'px')
                if (offset < BACKGROUND_MAX_OFFSET) {
                    requestAnimationFrame(animateBackground)
                }
            }
        }

        if (effectiveAnimationDuration > 0) {
            requestAnimationFrame(animateBackground)
        }

        return () => {
            isRunning = false
        }
    }, [props.isEnabled])

    return <div ref={rippleBackgroundRef} className="ripple-background" />
}
