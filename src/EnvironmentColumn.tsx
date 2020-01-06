import { Status, StatusSize, Statuses } from "azure-devops-ui/Status";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Ago } from "azure-devops-ui/Ago";
import { Link } from "azure-devops-ui/Link";
import { Duration } from "azure-devops-ui/Duration";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { css } from "azure-devops-ui/Util";
import { ITableColumn, SimpleTableCell, TwoLineTableCell } from "azure-devops-ui/Table";
import { ReleaseDef } from './ReleaseDef';
import React from "react";

export class EnvironmentColumn {
    id: string;
    name: string;
    width: number;

    constructor(environmentName: string) {
        this.id = environmentName;
        this.name = environmentName;
        this.width = 200;
    }

    public renderCell(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ReleaseDef>, tableItem: ReleaseDef): JSX.Element {
        const environment = tableItem.getEnvironment(tableColumn.name!);

        if (environment === undefined) {
            return (<SimpleTableCell columnIndex={columnIndex} />);
        }

        const version = environment.getDeployedVersion();
        const versionLink = environment.getDeployedVersionLink();
        const queuedOn = environment.deployment?.queuedOn ?? new Date();
        const status = environment.getStatus();

        return (
            <TwoLineTableCell
                className="bolt-table-cell-content-with-inline-link no-v-padding"
                key={"col-" + columnIndex}
                columnIndex={columnIndex}
                tableColumn={tableColumn}
                line1={
                    <span className="flex-row scroll-hidden">
                        <Status
                            {...status}
                            className="icon-large-margin"
                            size={
                                // @ts-ignore
                                StatusSize.m
                            } />

                        <div className="flex-row scroll-hidden">
                            <Tooltip overflowOnly={true}>
                                <Link
                                    className="fontSizeM font-size-m text-ellipsis bolt-table-link bolt-table-inline-link"
                                    excludeTabStop
                                    href={versionLink}
                                    target="_blank"
                                >
                                    {version}
                                </Link>
                            </Tooltip>
                        </div>
                    </span>
                }
                line2={
                    <span className="flex-row scroll-hidden">
                        {this.WithIcon({
                            className: "fontSize font-size",
                            iconProps: { iconName: "Calendar" },
                            children: (<Ago date={queuedOn} /*format={AgoFormat.Extended}*/ />)
                        })}
                    </span>
                }
            />
        );
    }

    private WithIcon(props: {
        className?: string;
        iconProps: IIconProps;
        children?: React.ReactNode;
    }): JSX.Element {
        return (
            <div className={css(props.className, "flex-row flex-center")}>
                {Icon({ ...props.iconProps, className: "icon-margin" })}
                {props.children}
            </div>
        );
    }
}
