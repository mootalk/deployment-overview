import { renderTreeCell, ITreeColumn } from "azure-devops-ui/TreeEx";
import { ITreeItemEx } from "azure-devops-ui/Utilities/TreeItemProvider";
import { SimpleTreeItem } from "./SimpleTreeItem";

export class TreeStageColumn {
    id: string;
    name: string;
    width: number;

    constructor(stage: string) {
        this.id = stage;
        this.name = stage;
        this.width = 300;
    }

    public renderCell(rowIndex: number, columnIndex: number, treecolumn: ITreeColumn<SimpleTreeItem>, treeItem: ITreeItemEx<SimpleTreeItem>): JSX.Element {
        return renderTreeCell(rowIndex, columnIndex, treecolumn, treeItem);
    }
}
