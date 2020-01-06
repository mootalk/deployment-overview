import { ReleaseDefinition } from 'azure-devops-extension-api/Release/Release';
import { Statuses, IStatusProps } from "azure-devops-ui/Status";
import { Environment } from "./Environment";

import { IReleasePath } from "./IReleasePath";
import { aggregateStatuses } from './StatusAggregator';

export class ReleaseDef implements IReleasePath {
    name: string;
    link: string;
    path: string;
    environments: Environment[];

    constructor(name: string, path: string, link: string, environments: Environment[]) {
        this.name = name;
        this.environments = environments.sort((a, b) => a.rank - b.rank);
        this.link = link;
        this.path = path;
    }

    public getEnvironmentsForStage(name: string): Environment[] {
        const regex = new RegExp(`\\b${name}\\b`, 'i');

        return this.environments.filter(env => regex.test(env.name));
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
}
