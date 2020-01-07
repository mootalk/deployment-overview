// React
import * as React from 'react';
import * as ReactDOM from "react-dom";

// SDK & API
import * as DevOps from "azure-devops-extension-sdk";

// Global UI
import { Card } from "azure-devops-ui/Card";

// UI Data
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

// Table
import {
    ITableColumn,
    Table
} from "azure-devops-ui/Table";

// Services, Models & UI
import { ReleaseService } from '../Data/ReleaseService';
import { ReleaseDef } from '../Data/ReleaseDef';
import { ReleaseColumn } from './ReleaseColumn';
import { StageColumn } from './StageColumn';

interface ITableState {
    releaseDefinitions: ReleaseDef[];
}

export class TableIndex extends React.Component<{}, ITableState> {
    private stages: string[] = ['Dev', 'Systemtest', 'Test', 'Prod'];
    private releaseService: ReleaseService = new ReleaseService();

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

    public async componentDidMount() {
        const definitions = await this.releaseService.getDefinitions();
        this.updateReleaseDefinitions(definitions);


        const promises: Promise<void>[] = [];
        definitions.forEach(def => {
            def.getReleasedEnvironments()
                .forEach(environment => {
                    promises.push(this.releaseService.updateEnvironmentWithDeploymentInformation(environment));
                })
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
        const columns: ITableColumn<ReleaseDef>[] = [new ReleaseColumn()];

        columns.push(new StageColumn("Dev"));
        columns.push(new StageColumn("Systemtest"));
        columns.push(new StageColumn("Test"));
        columns.push(new StageColumn("Prod"));

        this.columns = columns;
    }

    public render(): JSX.Element {
        return (
            <div className="page-content-left page-content-right page-content-top page-content-bottom">
                <Card
                    className="flex-grow">
                    <Table
                        itemProvider={this.itemProvider}
                        columns={this.columns}
                        scrollable={true}></Table>
                </Card>
            </div>
        );
    }
}