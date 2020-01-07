import { Release, ReleaseEnvironment, DeploymentStatus } from 'azure-devops-extension-api/Release/Release';
import { Statuses, IStatusProps } from "azure-devops-ui/Status";

export class Deployment {
    environmentName: string;
    queuedOn: Date;
    status: IStatusProps;
    releaseName: string;
    releaseLink: string;

    constructor(environmentName: string, queuedOn: Date, status: IStatusProps, releaseName: string, releaseLink: string) {
        this.environmentName = environmentName;
        this.queuedOn = queuedOn;
        this.status = status;
        this.releaseName = releaseName;
        this.releaseLink = releaseLink;
    }

    public getReleaseLink(): string {
        return this.releaseLink;
    }

    static create(releaseEnvironment: ReleaseEnvironment, release: Release): Deployment {
        const webLink = release._links.web.href;
        const sortedDeploySteps = releaseEnvironment.deploySteps.sort((a,b) => a.queuedOn.getTime() - b.queuedOn.getTime());
        const lastDeployStep = sortedDeploySteps.splice(-1)[0];

        return new Deployment(releaseEnvironment.name, lastDeployStep.queuedOn, Deployment.convert(lastDeployStep.status), release.name, webLink);
    }

    private static convert(status: DeploymentStatus): IStatusProps {
        switch (status) {
            case DeploymentStatus.Failed: return Statuses.Failed;
            case DeploymentStatus.Succeeded: return Statuses.Success;
            case DeploymentStatus.InProgress: return Statuses.Running;
            case DeploymentStatus.PartiallySucceeded: return Statuses.Warning;
            case DeploymentStatus.NotDeployed: return Statuses.Queued;
        }

        return Statuses.Skipped;
    }
}
