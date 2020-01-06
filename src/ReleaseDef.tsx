import { ReleaseDefinition } from 'azure-devops-extension-api/Release/Release';
import { Statuses, IStatusProps } from "azure-devops-ui/Status";
import { Environment } from "./Environment";

export class ReleaseDef {
    name: string;
    environments: Environment[];

    constructor(name: string, environments: Environment[]) {
        this.name = name;
        this.environments = environments;
    }

    public getEnvironment(name: string): Environment | undefined {
        const filteredEnvironments = this.environments.filter(env => env.name === name);

        if (filteredEnvironments.length === 0) {
            return undefined;
        }

        return filteredEnvironments[0];
    }

    public getReleasedEnvironments(): Environment[] {
        return this.environments.filter(env => env.hasCurrentRelease());
    }

    public getStatus(): IStatusProps {
        const allStatuses = this.getDistinctStatuses();
        if (allStatuses.length === 1) {
            return allStatuses[0];
        }
        if (allStatuses.every(s => s === Statuses.Success)) {
            return Statuses.Success;
        }
        if (this.contains(allStatuses, Statuses.Running)) {
            return Statuses.Running;
        }
        if (this.contains(allStatuses, Statuses.Failed)) {
            return Statuses.Failed;
        }
        if (this.contains(allStatuses, Statuses.Warning)) {
            return Statuses.Warning;
        }
        if (this.contains(allStatuses, Statuses.Waiting)) {
            return Statuses.Waiting;
        }
        return Statuses.Waiting;
    }

    private getDistinctStatuses(): IStatusProps[] {
        return this.environments
            .filter(env => env.hasCurrentRelease())
            .flatMap(env => env.getStatus())
            .filter(distinct);
        function distinct(value: IStatusProps, index: number, self: IStatusProps[]): boolean {
            return self.indexOf(value) === index;
        }
    }

    private contains(array: IStatusProps[], expected: IStatusProps) {
        return array.some(item => item === expected);
    }

    static create(releaseDefinition: ReleaseDefinition): ReleaseDef {
        const envs: Environment[] = [];
        releaseDefinition.environments.forEach(environment => {
            envs.push(Environment.create(environment));
        });
        return new ReleaseDef(releaseDefinition.name, envs);
    }
}
