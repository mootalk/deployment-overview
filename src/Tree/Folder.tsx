import { ITreeItem } from "azure-devops-ui/Utilities/TreeItemProvider";
import { IReleasePath } from "./IReleasePath";
import { IStatusProps, Status } from "azure-devops-ui/Status";
import { aggregateStatuses } from '../Data/StatusAggregator';
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Link } from "azure-devops-ui/Link";
import * as React from 'react';

export class Folder implements IReleasePath {
    public getStatus(): IStatusProps {
        const states = this.childItems.map(item => item.getStatus());
        return aggregateStatuses(states);
    }

    childItems: IReleasePath[] = [];
    id: string;
    name: string;
    path: string;

    public getNameCell(): React.ReactNode {
        return () =>
            <div><Status {...this.getStatus()} className="icon-large-margin" />
                <div className="flex-row scroll-hidden">
                    <Tooltip overflowOnly={true}>
                        <Link
                            className="fontSizeM font-size-m text-ellipsis bolt-table-link bolt-table-inline-link"
                            excludeTabStop
                            target="_blank"
                        >
                            {this.name}
                        </Link>
                    </Tooltip>
                </div>
            </div>;
    }

    getStageCell(stage: string): React.ReactNode {
        return () => <div></div>;
    }

    constructor(name: string, path: string) {
        this.id = path;
        if (!this.id.endsWith('\\')) {
            this.id += '\\';
        }
        this.id += name;
        this.name = name;
        this.path = path;
    }
}
