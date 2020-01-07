import { ReleaseDefinition } from 'azure-devops-extension-api/Release/Release';
import { Statuses, StatusSize, IStatusProps, Status } from "azure-devops-ui/Status";
import { Environment } from "./Environment";

// Table
import {
    TableColumnLayout
} from "azure-devops-ui/Table";

import { IReleasePath } from "../Tree/IReleasePath";
import { aggregateStatuses, aggregateStatusesFromEnvironments } from './StatusAggregator';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { Link } from 'azure-devops-ui/Link';
import { Ago } from 'azure-devops-ui/Ago';
import { IIconProps, Icon } from 'azure-devops-ui/Icon';
import { css } from 'azure-devops-ui/Util';
import { renderLoadingCell } from 'azure-devops-ui/Table';
import * as React from 'react';

export class ReleaseDef implements IReleasePath {
    childItems: IReleasePath[] = [];
    id: string;
    name: string;
    link: string;
    path: string;
    environments: Environment[];

    constructor(name: string, path: string, link: string, environments: Environment[]) {
        this.id = path;
        if (!this.id.endsWith('\\')) {
            this.id += '\\';
        }
        this.id += name;

        this.name = name;
        this.environments = environments.sort((a, b) => a.rank - b.rank);
        this.link = link;
        this.path = path;
    }

    public getEnvironmentsForStage(name: string): Environment[] {
        const regex = new RegExp(`\\b${name}\\b`, 'i');

        return this.environments
            .filter(env => regex.test(env.name));
    }

    public getEnvironment(name: string): Environment | undefined {
        const filteredEnvironments = this.environments.filter(env => env.name.toUpperCase() === name.toUpperCase());

        if (filteredEnvironments.length === 0) {
            return undefined;
        }

        return filteredEnvironments[0];
    }

    public getReleasedEnvironments(): Environment[] {
        return this.environments.filter(env => env.hasCurrentRelease());
    }

    public getStatus(): IStatusProps {
        return aggregateStatuses(this.getStates());
    }

    private getStates(): IStatusProps[] {
        return this.environments
            .filter(env => env.hasCurrentRelease())
            .map(env => env.getStatus());
    }

    static create(releaseDefinition: ReleaseDefinition): ReleaseDef {
        const envs: Environment[] = [];
        releaseDefinition.environments.forEach(environment => {
            envs.push(Environment.create(environment));
        });

        const webLink = releaseDefinition._links.web.href;
        return new ReleaseDef(releaseDefinition.name, releaseDefinition.path, webLink, envs);
    }

    public getNameCell(): React.ReactNode {
        return (
            <span>
                <Status {...this.getStatus()}
                    className="icon-margin"
                    size={
                        // @ts-ignore
                        StatusSize.m
                    } />

                <Link
                    className="bolt-table-link no-left-padding"
                    href={this.link}
                    target="_blank" >
                    {this.name}
                </Link>
            </span>);
    }

    public getStageCell(stage: string): React.ReactNode {
        const environments = this.getEnvironmentsForStage(stage);
        const status = aggregateStatusesFromEnvironments(environments);

        if (environments.length === 0) {
            return (<div />);
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
        var versionLink = this.link;
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
            <div>
                <span className="flex-row scroll-hidden">
                    <Status
                        {...status}
                        className="icon-margin"
                        size={
                            // @ts-ignore
                            StatusSize.m
                        } />

                    <Link
                        className="bolt-table-link"
                        excludeTabStop
                        href={versionLink}
                        target="_blank"
                    >
                        {version}
                    </Link>
                </span>

                {this.WithIcon({
                    className: "fontSize font-size",
                    iconProps: { iconName: "Calendar" },
                    children: (<Ago date={queuedOn} /*format={AgoFormat.Extended}*/ />)
                })}
            </div>
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
