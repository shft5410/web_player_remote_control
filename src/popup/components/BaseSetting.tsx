import React from 'react'

import '@/popup/components/BaseSetting.scss'

type Props = {
    label: string
    isExpandable?: boolean
}

export default function BaseSetting(props: React.PropsWithChildren<Props>) {
    const collapsibleContainerRef = React.useRef<HTMLDivElement>(null)
    const [isExpanded, setIsExpanded] = React.useState<boolean>(false)

    function handleToggleExpand() {
        if (!props.isExpandable) return
        setIsExpanded((prev) => !prev)
    }

    React.useLayoutEffect(() => {
        if (props.isExpandable && collapsibleContainerRef.current) {
            collapsibleContainerRef.current.style.maxHeight = isExpanded
                ? collapsibleContainerRef.current.scrollHeight + 'px'
                : '0px'
        }
    }, [isExpanded, props.isExpandable])

    const baseSettingClasses = ['base-setting']
    if (props.isExpandable) {
        baseSettingClasses.push('base-setting--expandable')
    }
    if (isExpanded) {
        baseSettingClasses.push('base-setting--expanded')
    }

    return (
        <div className={baseSettingClasses.join(' ')}>
            <div className="base-setting__first-row" onClick={handleToggleExpand}>
                <h2 className="base-setting__first-row__label">{props.label}</h2>
                {!props.isExpandable && (
                    <div className="base-setting__first-row__control-wrapper">{props.children}</div>
                )}
                {props.isExpandable && <div className="base-setting__first-row__expand-indicator" />}
            </div>
            {props.isExpandable && (
                <div ref={collapsibleContainerRef} className="base-setting__collapsible-container">
                    <div className="base-setting__second-row">{props.children}</div>
                </div>
            )}
        </div>
    )
}
