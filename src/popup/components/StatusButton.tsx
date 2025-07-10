import React from 'react'

import '@/popup/components/StatusButton.scss'
import TranslucentButton from '@/popup/components/TranslucentButton'

type StatusVariant = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    text: string
}

type Props = {
    label: string
    onClick?: () => void
    statusVariants: [StatusVariant, ...StatusVariant[]]
    variantIndex: number
}

/**
 * Component that renders a button with a status indicator next to it.
 *
 * On hover, the status element expands and displays a text description of the current status.
 *
 * @param props Component props.
 * @param props.label The text displayed on the button.
 * @param props.onClick The function to call when the button is clicked.
 * @param props.statusVariants An array of status variants, each containing an icon and text.
 * @param props.variantIndex The index of the currently active status variant.
 */
export default function StatusButton(props: Props) {
    const collapsibleContainerRef = React.useRef<HTMLDivElement>(null)
    const [isStatusExpanded, setIsStatusExpanded] = React.useState<boolean>(false)

    // Component to render the icon for the active status variant
    const StatusIcon = React.useMemo(() => {
        return props.statusVariants[props.variantIndex].icon
    }, [props.statusVariants[props.variantIndex].icon])

    // Text for the active status variant
    const statusText = React.useMemo(() => {
        return props.statusVariants[props.variantIndex].text
    }, [props.statusVariants[props.variantIndex].text])

    /**
     * Effect to handle the expansion and collapse of the status text container.
     *
     * The effect is rerun when the expand status or the status text changes.
     */
    React.useEffect(() => {
        if (isStatusExpanded) {
            collapsibleContainerRef.current!.style.maxWidth = collapsibleContainerRef.current!.scrollWidth + 'px'
        } else {
            collapsibleContainerRef.current!.style.maxWidth = '0px'
        }
    }, [isStatusExpanded, props.statusVariants[props.variantIndex].text])

    /**
     * Expand the status text container when the mouse enters the status element.
     */
    function handleMouseEnter() {
        setIsStatusExpanded(true)
    }

    /**
     * Collapse the status text container when the mouse leaves the status element.
     */
    function handleMouseLeave() {
        setIsStatusExpanded(false)
    }

    return (
        <div className="status-button">
            <TranslucentButton onClick={props.onClick}>{props.label}</TranslucentButton>
            <div className="status-button__status" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <StatusIcon className="status-button__status__icon" />
                <div ref={collapsibleContainerRef} className="status-button__status__collapsible-container">
                    <span className="status-button__status__text">{statusText}</span>
                </div>
            </div>
        </div>
    )
}
