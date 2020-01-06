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

// Services, Models & UI
import { ReleaseService } from './ReleaseService';
import { ReleaseDef } from './ReleaseDef';
import { Environment } from './Environment';
import { ReleaseColumn } from './ReleaseColumn';
import { EnvironmentColumn } from './EnvironmentColumn';

interface IAppState {
    releaseDefinitions: ReleaseDef[];
}

export class App extends React.Component<{}, IAppState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            releaseDefinitions: []
        };

        this.updateReleaseDefinitions([]);
    }

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

        this.setState({ releaseDefinitions: releaseDefinitions });
    }

    private setColumns(releaseDefinitions: ReleaseDef[]) {
        const environments = releaseDefinitions.flatMap(def => def.environments);
        const environmentMap = new Map();

        for (var item of environments) {
            var e = environmentMap.get(item.name)
            if (e) {
                e.rank = Math.max(e.rank, item.rank);
            } else {
                environmentMap.set(item.name,
                    { name: item.name, rank: item.rank })
            }
        }

        var result = Array.from(environmentMap.values());

        const columns: ITableColumn<ReleaseDef>[] = [new ReleaseColumn()];
        const environmentColumns = result
            .sort((left, right) => left.rank - right.rank)
            .filter(distinct)
            .map(columnName => new EnvironmentColumn(columnName.name));

        columns.push(...environmentColumns);
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
                </Page>
            </Surface>
        );
    }
}

showRootComponent(<App />);

export function showRootComponent(component: React.ReactElement<any>) {
    ReactDOM.render(component, document.getElementById("root"));
}
