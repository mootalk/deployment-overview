import { Release, ReleaseEnvironment, DeploymentStatus } from 'azure-devops-extension-api/Release/Release';
import { Statuses, IStatusProps } from "azure-devops-ui/Status";

export class Deployment {
    environmentName: string;
    queuedOn: Date;
    status: IStatusProps;
    releaseName: string;

    constructor(environmentName: string, queuedOn: Date, status: IStatusProps, releaseName: string) {
        this.environmentName = environmentName;
        this.queuedOn = queuedOn;
        this.status = status;
        this.releaseName = releaseName;
    }

    static create(releaseEnvironment: ReleaseEnvironment, release: Release): Deployment {
        const sortedDeploySteps = releaseEnvironment.deploySteps.sort(step => step.queuedOn.getTime());
        const lastDeployStep = sortedDeploySteps.splice(-1)[0];
        return new Deployment(releaseEnvironment.name, lastDeployStep.queuedOn, Deployment.convert(lastDeployStep.status), release.name);
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
