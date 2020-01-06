import { ReleaseDefinitionEnvironment } from 'azure-devops-extension-api/Release/Release';
import { Statuses, IStatusProps } from "azure-devops-ui/Status";
import { Deployment } from "./Deployment";

export class Environment {
    id: number;
    name: string;
    rank: number;
    currentReleaseId?: number;
    deployment?: Deployment;

    public isLoading(): boolean {
        return this.currentReleaseId !== undefined && this.deployment === undefined;
    }

    public hasCurrentRelease(): boolean {
        return this.currentReleaseId !== undefined;
    }

    public getStatus(): IStatusProps {
        if (this.deployment !== undefined) {
            return this.deployment.status;
        }
        return Statuses.Queued;
    }

    public getDeployedVersion(): string {
        if (this.deployment !== undefined) {
            return this.deployment!.releaseName;
        }
        return '-';
    }

    public getDeployedVersionLink(): string | undefined {
        if (this.deployment === undefined) {
            return undefined;
        }

        return this.deployment.getReleaseLink();
    }

    constructor(id: number, name: string, rank: number, currentReleaseId?: number) {
        this.id = id;
        this.name = name;
        this.rank = rank;
        this.currentReleaseId = currentReleaseId;
    }

    public setDeployment(deployment: Deployment) {
        this.deployment = deployment;
    }

    static create(environment: ReleaseDefinitionEnvironment) {
        var currentReleaseId: number | undefined = undefined;
        if (environment.currentRelease) {
            currentReleaseId = environment.currentRelease.id;
        }
        if (currentReleaseId === 0) {
            currentReleaseId = undefined;
        }
        return new Environment(environment.id, environment.name, environment.rank, currentReleaseId);
    }
}
