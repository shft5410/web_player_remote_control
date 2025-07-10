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

/**
 * Component that renders a ripple background animation.
 *
 * @param props Component props.
 * @param props.spreadFactors An array of spread factors that determine how far the ripples spread.
 * @param props.spreadFactorIndex The index of the currently active spread factor.
 */
export default function RippleBackground(props: Props) {
    const rippleBackgroundRef = React.useRef<HTMLDivElement>(null)
    const backgroundGradientOffset = React.useRef(BACKGROUND_MAX_OFFSET)

    /**
     * Effect to animate the ripple background.
     *
     * The effect repeatedly updates the position of the ripples by registering a callback on each animation frame.
     * The cleanup function stops the animation.
     */
    React.useEffect(() => {
        let isRunning: boolean = true

        /**
         * Animate the ripples by updating the background gradient offset.
         *
         * @param timestamp The timestamp of the current animation frame.
         */
        function animateRipples(timestamp: number) {
            if (!isRunning) {
                return
            }

            // Calculate the current animation progress based on the timestamp
            const animationProgress = (timestamp % RIPPLE_ANIMATION_DURATION) / RIPPLE_ANIMATION_DURATION

            // Apply the animation progress to the ripple background by updating the CSS variable
            rippleBackgroundRef.current!.style.setProperty('--ripple-gradient-offset', animationProgress * 20 + 'px')

            requestAnimationFrame(animateRipples)
        }
        requestAnimationFrame(animateRipples)

        return () => {
            // Cleanup: stop the animation
            isRunning = false
        }
    }, [])

    /**
     * Effect to animate the background gradient offset based on the spread factor.
     *
     * The effect is rerun when the stringified array of spread factors or the current spread factor index changes.
     * It repeatedly updates the background gradient by registering a callback on each animation frame.
     * The cleanup function stops the animation.
     */
    React.useEffect(() => {
        let isRunning: boolean = true
        let startTimestamp: number | null = null
        const startOffset = backgroundGradientOffset.current
        const targetSpreadFactor = clamp(props.spreadFactors?.[props.spreadFactorIndex ?? 0] ?? 1, 0, 1)
        const targetOffset = (1 - targetSpreadFactor) * BACKGROUND_MAX_OFFSET
        const deltaOffset = targetOffset - startOffset
        const effectiveDuration = BACKGROUND_ANIMATION_DURATION * (Math.abs(deltaOffset) / BACKGROUND_MAX_OFFSET)

        /**
         * Animate the background gradient to the target spread factor.
         *
         * @param timestamp The timestamp of the current animation frame.
         */
        function animateBackground(timestamp: number) {
            if (!isRunning) {
                return
            }

            if (startTimestamp === null) {
                // Initialize the start timestamp on the first frame
                startTimestamp = timestamp
                requestAnimationFrame(animateBackground)
                return
            }

            // Calculate the current animation progress based on the timestamp
            const animationProgress = (timestamp - startTimestamp) / effectiveDuration

            // Apply the animation progress to the background gradient offset
            const offset = startOffset + Math.min(animationProgress, 1) * deltaOffset
            backgroundGradientOffset.current = offset
            rippleBackgroundRef.current!.style.setProperty('--background-gradient-offset', offset + 'px')

            if (animationProgress < 1) {
                // Continue animating until the animation is complete
                requestAnimationFrame(animateBackground)
            }
        }
        if (effectiveDuration > 0) {
            // Start the background animation if there is something to animate (duration > 0)
            requestAnimationFrame(animateBackground)
        }

        return () => {
            // Cleanup: stop the animation
            isRunning = false
        }
    }, [JSON.stringify(props.spreadFactors), props.spreadFactorIndex])

    return <div ref={rippleBackgroundRef} className="ripple-background" />
}
