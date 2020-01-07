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
    private static projectId?: string;
    private static gottenReleases = new Map<number, Release>();

    public static async getDefinitions(): Promise<ReleaseDef[]> {
        const definitions = await this.getReleaseDefinitions();
        var newDefs = definitions.map(def => ReleaseDef.create(def));

        return newDefs;
    }

    public static async updateEnvironmentWithDeploymentInformation(environment: Environment): Promise<void> {
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

    private static async getReleaseDefinitions(): Promise<ReleaseDefinition[]> {
        const projectId = await this.getProjectId();
        const releaseClient = getClient(ReleaseRestClient);
        return await releaseClient.getReleaseDefinitions(projectId, undefined, ReleaseDefinitionExpands.Environments);
    }

    private static async getRelease(releaseId: number): Promise<Release> {
        const projectId = await this.getProjectId();
        const releaseClient = getClient(ReleaseRestClient);

        var release = this.gottenReleases.get(releaseId);
        if (release === undefined) {
            release = await releaseClient.getRelease(projectId, releaseId);
        }

        return release;
    }

    private static async getProjectId(): Promise<string> {
        if (this.projectId) {
            return this.projectId!;
        }

        const projectService = await DevOps.getService<IProjectPageService>(
            // @ts-ignore
            CommonServiceIds.ProjectPageService
        );

        const currentProject = await projectService.getProject();
        return currentProject?.id ?? '';
    }
}