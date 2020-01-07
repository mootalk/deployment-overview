import { renderExpandableTreeCell, ITreeColumn } from "azure-devops-ui/TreeEx";
import { ITreeItemEx } from "azure-devops-ui/Utilities/TreeItemProvider";
import { SimpleTreeItem } from "./SimpleTreeItem";

export class TreeReleaseColumn {
    id: string;
    name: string;
    width: number;
    constructor() {
        this.id = 'name';
        this.name = 'Name';
        this.width = 300;
    }

    public renderCell(rowIndex: number, columnIndex: number, treecolumn: ITreeColumn<SimpleTreeItem>, treeItem: ITreeItemEx<SimpleTreeItem>): JSX.Element {
        return renderExpandableTreeCell(rowIndex, columnIndex, treecolumn, treeItem);
    }
}
