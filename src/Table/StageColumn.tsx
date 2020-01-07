import { Status, StatusSize, Statuses } from "azure-devops-ui/Status";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Ago } from "azure-devops-ui/Ago";
import { Link } from "azure-devops-ui/Link";
import { Duration } from "azure-devops-ui/Duration";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { css } from "azure-devops-ui/Util";
import { ITableColumn, SimpleTableCell, TwoLineTableCell, renderLoadingCell, TableColumnLayout } from "azure-devops-ui/Table";
import { ReleaseDef } from '../Data/ReleaseDef';
import React from "react";
import { render } from "react-dom";
import { aggregateStatusesFromEnvironments } from "../Data/StatusAggregator";

export class StageColumn {
    id: string;
    name: string;
    width: number;

    constructor(stageName: string) {
        this.id = stageName;
        this.name = stageName;
        this.width = 200;
    }

    public renderCell(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ReleaseDef>, tableItem: ReleaseDef): JSX.Element {
        const environments = tableItem.getEnvironmentsForStage(tableColumn.name!);
        const status = aggregateStatusesFromEnvironments(environments);

        if (environments.length === 0) {
            return (<SimpleTableCell columnIndex={columnIndex} />);
        }

        var firstEnvironment = environments[0];
        if (firstEnvironment.isLoading()) {
            const loadingCell = renderLoadingCell(
                // @ts-ignore
                TableColumnLayout.twoLine);
            if (loadingCell) {
                return loadingCell;
            }
        }

        var version = 'Multiple versions found!';
        var versionLink = tableItem.link;
        var queuedOn = firstEnvironment.deployment?.queuedOn ?? new Date();

        const versions = environments
            .map(env => env.getDeployedVersion())
            .filter(distinct);

        function distinct(value: string, index: number, self: string[]): boolean {
            return self.indexOf(value) === index;
        }

        if (versions.length === 1) {
            version = firstEnvironment.getDeployedVersion();
            versionLink = firstEnvironment.getDeployedVersionLink() ?? '';
        }

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
