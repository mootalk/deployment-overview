import { Status, StatusSize, Statuses } from "azure-devops-ui/Status";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Ago } from "azure-devops-ui/Ago";
import { Link } from "azure-devops-ui/Link";
import { Duration } from "azure-devops-ui/Duration";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { css } from "azure-devops-ui/Util";
import { ITableColumn, SimpleTableCell, TwoLineTableCell, renderLoadingCell, TableColumnLayout } from "azure-devops-ui/Table";
import { ReleaseDef } from './ReleaseDef';
import React from "react";
import { render } from "react-dom";
import { Environment } from "./Environment";
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";

export class StagesColumn {
    id: string;
    name: string;
    width: number;

    constructor() {
        this.id = "stages";
        this.name = "Stages";
        this.width = 2000;
    }

    public renderCell(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ReleaseDef>, tableItem: ReleaseDef): JSX.Element {
        const environments = tableItem.environments;

        const pills = environments.map(env => this.renderPill(env));

        return (<PillGroup className="flex-row">{pills}</PillGroup>);
    }

    private renderPill(environment: Environment): JSX.Element {
        const name = environment.name;

        return (<Pill
            size={
                // @ts-ignore
                PillSize.regular}>
            <span className="flex-row scroll-hidden">
                {this.renderStatus(environment)}

                <div className="flex-row scroll-hidden">
                    {name}
                </div>
            </span>
            <span>
                <div className="flex-row scroll-hidden">
                    {this.renderVersion(environment)}
                    @
                    {this.renderSimpleDate(environment.deployment?.queuedOn)}
                </div>
            </span>
        </Pill>);
    }

    private renderSimpleDate(date: Date | undefined): JSX.Element | undefined {
        if (date === undefined) {
            return;
        }

        return <Ago date={date} /*format={AgoFormat.Extended}*/ />;
    }

    private renderDate(date: Date | undefined): JSX.Element | undefined {
        if (date === undefined) {
            return;
        }

        return this.WithIcon({
            className: "fontSize font-size",
            iconProps: { iconName: "Calendar" },
            children: (<Ago date={date} /*format={AgoFormat.Extended}*/ />)
        })
    }

    private renderVersion(environment: Environment): JSX.Element {
        const version = environment.getDeployedVersion();
        const versionLink = environment.getDeployedVersionLink();

        return (<Tooltip overflowOnly={true}>
            <Link
                className="fontSizeM font-size-m text-ellipsis bolt-table-link bolt-table-inline-link"
                excludeTabStop
                href={versionLink}
                target="_blank" >
                {version}
            </Link>
        </Tooltip>);
    }

    private renderStatus(environment: Environment): JSX.Element {
        return (<Status
            {...environment.getStatus()}
            className="icon-large-margin"
            size={
                // @ts-ignore
                StatusSize.m
            } />);
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
