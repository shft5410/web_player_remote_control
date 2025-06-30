import React from 'react'

import '@/popup/components/RippleBackground.scss'
import clamp from '@/utils/clamp'

const RIPPLE_ANIMATION_DURATION = 1500 // milliseconds
const BACKGROUND_ANIMATION_DURATION = 500 // milliseconds
const BACKGROUND_MAX_OFFSET = 180 // pixels

type Props = {
    spreadFactors?: number[]
    spreadFactorIndex?: number
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
        let startTimestamp: number | null = null
        const startOffset = backgroundGradientOffset.current
        const targetSpreadFactor = clamp(props.spreadFactors?.[props.spreadFactorIndex ?? 0] ?? 1, 0, 1)
        const targetOffset = (1 - targetSpreadFactor) * BACKGROUND_MAX_OFFSET
        const deltaOffset = targetOffset - startOffset
        const effectiveDuration = BACKGROUND_ANIMATION_DURATION * (Math.abs(deltaOffset) / BACKGROUND_MAX_OFFSET)

        function animateBackground(timestamp: number) {
            if (!isRunning) {
                return
            }

            if (startTimestamp === null) {
                startTimestamp = timestamp
                requestAnimationFrame(animateBackground)
                return
            }

            const animationProgress = (timestamp - startTimestamp) / effectiveDuration
            const offset = startOffset + Math.min(animationProgress, 1) * deltaOffset
            backgroundGradientOffset.current = offset
            rippleBackgroundRef.current!.style.setProperty('--background-gradient-offset', offset + 'px')

            if (animationProgress < 1) {
                requestAnimationFrame(animateBackground)
            }
        }
        if (effectiveDuration > 0) {
            requestAnimationFrame(animateBackground)
        }

        return () => {
            isRunning = false
        }
    }, [props.spreadFactors, props.spreadFactorIndex])

    return <div ref={rippleBackgroundRef} className="ripple-background" />
}
