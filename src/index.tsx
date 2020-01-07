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

import { TableIndex } from './Table/TableIndex';
import { TreeIndex } from './Tree/TreeIndex';

export class App extends React.Component<{}, {}> {
     constructor(props: {}) {
        super(props);
    }

    public async componentWillMount() {
        DevOps.init();
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

                    {/* <TableIndex /> */}
                    <TreeIndex />
                </Page>
            </Surface>
        );
    }
}

showRootComponent(<App />);

export function showRootComponent(component: React.ReactElement<any>) {
    ReactDOM.render(component, document.getElementById("root"));
}
