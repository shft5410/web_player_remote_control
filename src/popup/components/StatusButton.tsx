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

export default function StatusButton(props: Props) {
    const collapsibleContainerRef = React.useRef<HTMLDivElement>(null)
    const [isStatusExpanded, setIsStatusExpanded] = React.useState<boolean>(false)

    const StatusIcon = React.useMemo(() => {
        return props.statusVariants[props.variantIndex].icon
    }, [props.statusVariants[props.variantIndex].icon])

    const statusText = React.useMemo(() => {
        return props.statusVariants[props.variantIndex].text
    }, [props.statusVariants[props.variantIndex].text])

    React.useEffect(() => {
        if (isStatusExpanded) {
            collapsibleContainerRef.current!.style.maxWidth = collapsibleContainerRef.current!.scrollWidth + 'px'
        } else {
            collapsibleContainerRef.current!.style.maxWidth = '0px'
        }
    }, [isStatusExpanded, props.statusVariants[props.variantIndex].text])

    function handleMouseEnter() {
        setIsStatusExpanded(true)
    }

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
