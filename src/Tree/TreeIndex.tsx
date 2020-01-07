// React
import * as React from 'react';
import * as ReactDOM from "react-dom";

// SDK & API
import * as DevOps from "azure-devops-extension-sdk";

// Global UI
import { Card } from "azure-devops-ui/Card";

// Tree
import { Tree } from "azure-devops-ui/TreeEx";
import { ITreeItemProvider, ITreeItemEx } from "azure-devops-ui/Utilities/TreeItemProvider";

// Services, Models & UI
import { ReleaseService } from '../Data/ReleaseService';
import { ReleaseDef } from '../Data/ReleaseDef';
import { SimpleTreeItem } from './SimpleTreeItem';
import { TreeReleaseColumn } from './TreeReleaseColumn';
import { TreeProvider } from './TreeProvider';
import { TreeStageColumn } from './TreeStageColumn';

interface ITreeState {
    releaseDefinitions: ReleaseDef[];
}

export class TreeIndex extends React.Component<{}, ITreeState> {
    private stages: string[] = ['Dev', 'Systemtest', 'Test', 'Prod'];

    constructor(props: {}) {
        super(props);

        this.state = {
            releaseDefinitions: []
        };

        this.updateReleaseDefinitions([]);
    }

    private treeItemProvider!: ITreeItemProvider<SimpleTreeItem>;
    private treeColumns = [
        new TreeReleaseColumn(),
        new TreeStageColumn("Dev"),
        new TreeStageColumn("Systemtest"),
        new TreeStageColumn("Test"),
        new TreeStageColumn("Prod"),
    ];

    public async componentDidMount() {
        const definitions = await ReleaseService.getDefinitions();
        this.updateReleaseDefinitions(definitions);


        const promises: Promise<void>[] = [];
        definitions.forEach(def => {
            def.getReleasedEnvironments()
                .forEach(environment => {
                    promises.push(ReleaseService.updateEnvironmentWithDeploymentInformation(environment));
                })
        });

        await Promise.all(promises);
        this.updateReleaseDefinitions(definitions);
    }

    private updateReleaseDefinitions(releaseDefinitions: ReleaseDef[]) {
        const providerBuilder = new TreeProvider(releaseDefinitions, this.stages);
        this.treeItemProvider = providerBuilder.getItemProvider();

        this.setState({ releaseDefinitions: releaseDefinitions });
    }

    public render(): JSX.Element {
        return (
            <div className="page-content-left page-content-right page-content-top page-content-bottom">
                <Card
                    className="flex-grow bolt-card-no-vertical-padding"
                    contentProps={{ contentPadding: false }}
                >
                    <Tree<SimpleTreeItem>
                        columns={this.treeColumns}
                        itemProvider={this.treeItemProvider}
                        onToggle={(event, treeItem: ITreeItemEx<SimpleTreeItem>) => {
                            this.treeItemProvider.toggle(treeItem.underlyingItem);
                        }}
                        scrollable={true}
                    />
                </Card>
            </div>
        );
    }
}