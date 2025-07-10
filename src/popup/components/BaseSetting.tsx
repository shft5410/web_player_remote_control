import React from 'react'

import '@/popup/components/BaseSetting.scss'

type Props = {
    label: string
    isExpandable?: boolean
}

/**
 * Component for a base setting that can optionally be expandable.
 *
 * @param props Component props.
 * @param props.label The label for the setting.
 * @param props.isExpandable Whether the setting is expandable or not. Defaults to false.
 */
export default function BaseSetting(props: React.PropsWithChildren<Props>) {
    const collapsibleContainerRef = React.useRef<HTMLDivElement>(null)
    const [isExpanded, setIsExpanded] = React.useState<boolean>(false)

    /**
     * Toggle the expanded state of the setting.
     */
    function handleToggleExpand() {
        if (!props.isExpandable) return
        setIsExpanded((prev) => !prev)
    }

    /**
     * Effect to expand or collapse the setting when it is expandable.
     *
     * The effect reruns when the expand state or the `isExpandable` prop changes.
     */
    React.useLayoutEffect(() => {
        if (props.isExpandable && collapsibleContainerRef.current) {
            collapsibleContainerRef.current.style.maxHeight = isExpanded
                ? collapsibleContainerRef.current.scrollHeight + 'px'
                : '0px'
        }
    }, [isExpanded, props.isExpandable])

    // Determine the classes for the base setting container
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
