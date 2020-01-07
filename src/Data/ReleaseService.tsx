// SDK & API
import * as DevOps from "azure-devops-extension-sdk";
import {
    CommonServiceIds,
    IProjectPageService,
    getClient
} from "azure-devops-extension-api";
import { ReleaseRestClient } from 'azure-devops-extension-api/Release/ReleaseClient';
import { ReleaseDefinition, Release, ReleaseDefinitionExpands } from 'azure-devops-extension-api/Release/Release';

import { ReleaseDef } from './ReleaseDef';
import { Environment } from './Environment';
import { Deployment } from './Deployment';

export class ReleaseService {
    private projectId: Promise<string> = this.getProjectId();
    private releasePromises = new Map<number, Promise<Release>>();

    public async getDefinitions(): Promise<ReleaseDef[]> {
        const definitions = await this.getReleaseDefinitions();
        var newDefs = definitions.map(def => ReleaseDef.create(def));

        return newDefs;
    }

    public async updateEnvironmentWithDeploymentInformation(environment: Environment): Promise<void> {
        const releaseId = environment.currentReleaseId;
        if (!releaseId) {
            console.log(environment);
            throw "Release id is unknown! Environment was: " + environment;
        }

        var release = await this.getRelease(releaseId!);

        const releaseEnvironment = release.environments.filter(relEnv => relEnv.definitionEnvironmentId === environment.id)[0];
        const deployment = Deployment.create(releaseEnvironment, release);

        environment.setDeployment(deployment);
    }

    private async getReleaseDefinitions(): Promise<ReleaseDefinition[]> {
        const projectId = await this.projectId;
        const releaseClient = getClient(ReleaseRestClient);
        return await releaseClient.getReleaseDefinitions(projectId, undefined, ReleaseDefinitionExpands.Environments);
    }

    private async getRelease(releaseId: number): Promise<Release> {
        const projectId = await this.projectId;
        const releaseClient = getClient(ReleaseRestClient);

        var release = this.releasePromises.get(releaseId);
        if (release === undefined) {
            release = releaseClient.getRelease(projectId, releaseId);
            this.releasePromises.set(releaseId, release);
        }

        return await release;
    }

    private async getProjectId(): Promise<string> {
        const projectService = await DevOps.getService<IProjectPageService>(
            // @ts-ignore
            CommonServiceIds.ProjectPageService
        );

        const currentProject = await projectService.getProject();
        return currentProject?.id ?? '';
    }
}