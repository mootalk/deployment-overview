// React
import * as React from 'react';
import * as ReactDOM from "react-dom";

// SDK & API
import * as DevOps from "azure-devops-extension-sdk";

// Global UI
import './index.scss';
import "azure-devops-ui/Core/_platformCommon.scss";
import { Surface } from 'azure-devops-ui/Surface';
import { Header, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Card } from "azure-devops-ui/Card";

// UI Data
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

// Table
import {
    ITableColumn,
    Table
} from "azure-devops-ui/Table";

// Tree
import { Tree } from "azure-devops-ui/TreeEx";
import { ITreeItemProvider, ITreeItemEx } from "azure-devops-ui/Utilities/TreeItemProvider";

// Services, Models & UI
import { ReleaseService } from './Data/ReleaseService';
import { ReleaseDef } from './Data/ReleaseDef';
import { Environment } from './Data/Environment';
import { ReleaseColumn } from './Table/ReleaseColumn';
import { EnvironmentColumn } from './Table/EnvironmentColumn';
import { StagesColumn } from './Table/StagesColumn';
import { StageColumn } from './Table/StageColumn';
import { SimpleTreeItem } from './Tree/SimpleTreeItem';
import { TreeReleaseColumn } from './Tree/TreeReleaseColumn';
import { TreeProvider } from './Tree/TreeProvider';
import { TreeStageColumn } from './Tree/TreeStageColumn';

interface IAppState {
    releaseDefinitions: ReleaseDef[];
}

export class App extends React.Component<{}, IAppState> {
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
        new TreeStageColumn("dev")
    ];

    private itemProvider!: ArrayItemProvider<ReleaseDef>;
    private columns: ITableColumn<ReleaseDef>[] = [
        new ReleaseColumn()
    ];

    public async componentWillMount() {
        DevOps.init();
    }

    public async componentDidMount() {
        const definitions = await ReleaseService.getDefinitions();
        this.updateReleaseDefinitions(definitions);


        const promises: Promise<void>[] = [];
        definitions.flatMap(def => def.getReleasedEnvironments())
            .forEach(environment => {
                promises.push(ReleaseService.updateEnvironmentWithDeploymentInformation(environment));
            });

        await Promise.all(promises);
        this.updateReleaseDefinitions(definitions);
    }

    private updateReleaseDefinitions(releaseDefinitions: ReleaseDef[]) {
        this.setColumns(releaseDefinitions);

        this.itemProvider = new ArrayItemProvider(releaseDefinitions);
        // const providerBuilder = new TreeProvider(releaseDefinitions, this.stages);
        // this.treeItemProvider = providerBuilder.getItemProvider();

        this.setState({ releaseDefinitions: releaseDefinitions });
    }

    private setColumns(releaseDefinitions: ReleaseDef[]) {
        // const environments = releaseDefinitions.flatMap(def => def.environments);
        // const environmentMap = new Map();

        // for (var item of environments) {
        //     var e = environmentMap.get(item.name)
        //     if (e) {
        //         e.rank = Math.max(e.rank, item.rank);
        //     } else {
        //         environmentMap.set(item.name,
        //             { name: item.name, rank: item.rank })
        //     }
        // }

        // var result = Array.from(environmentMap.values());

        const columns: ITableColumn<ReleaseDef>[] = [new ReleaseColumn()];

        columns.push(new StageColumn("Dev"));
        columns.push(new StageColumn("Systemtest"));
        columns.push(new StageColumn("Test"));
        columns.push(new StageColumn("Prod"));

        // columns.push(new StagesColumn());

        // const environmentColumns = result
        //     .sort((left, right) => left.rank - right.rank)
        //     .filter(distinct)
        //     .map(columnName => new EnvironmentColumn(columnName.name));

        // columns.push(...environmentColumns);

        this.columns = columns;
        function distinct(value: Environment, index: number, self: Environment[]): boolean {
            return self.findIndex(env => env.name.toUpperCase() == value.name.toUpperCase()) === index;
        }
    }

    public render(): JSX.Element {
        return (
            <Surface background={1}>
                <Page className="deployment-service flex-grow">
                    <Header
                        title="Deployment overview"
                        titleSize={
                            // @ts-ignore
                            TitleSize.Medium
                        }
                    />
                    <div className="page-content-left page-content-right page-content-top page-content-bottom">
                        <Card
                            className="flex-grow">
                            <Table
                                itemProvider={this.itemProvider}
                                columns={this.columns}
                                scrollable={true}></Table>
                        </Card>
                    </div>

                    {/* <div className="page-content-left page-content-right page-content-top page-content-bottom">
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
                    </div> */}
                </Page>
            </Surface>
        );
    }
}

showRootComponent(<App />);

export function showRootComponent(component: React.ReactElement<any>) {
    ReactDOM.render(component, document.getElementById("root"));
}
