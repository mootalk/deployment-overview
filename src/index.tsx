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
        console.log('hi there');
        const definitions = await ReleaseService.getDefinitions();
        console.log('look what I found!');
        console.log(definitions);
        this.updateReleaseDefinitions(definitions);
    }

    private updateReleaseDefinitions(releaseDefinitions: ReleaseDef[]) {
        this.setColumns(releaseDefinitions);

        this.itemProvider = new ArrayItemProvider(releaseDefinitions);

        this.setState({ releaseDefinitions: releaseDefinitions });
    }

    private setColumns(releaseDefinitions: ReleaseDef[]) {
        const columns: ITableColumn<ReleaseDef>[] = [new ReleaseColumn()];
        const environmentColumns = releaseDefinitions
            .flatMap(def => def.environments)
            .sort((left, right) => left.rank - right.rank)
            .map(env => env.name)
            .filter(distinct)
            .map(columnName => new EnvironmentColumn(columnName));

        columns.push(...environmentColumns);
        this.columns = columns;
        function distinct(value: string, index: number, self: string[]): boolean {
            return self.indexOf(value) === index;
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

                    <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
                        <Table
                            className="page-content-left page-content-right page-content-top page-content-bottom"
                            itemProvider={this.itemProvider}
                            columns={this.columns}></Table>
                    </Card>
                </Page>
            </Surface>
        );
    }
}

showRootComponent(<App />);

export function showRootComponent(component: React.ReactElement<any>) {
    ReactDOM.render(component, document.getElementById("root"));
}
