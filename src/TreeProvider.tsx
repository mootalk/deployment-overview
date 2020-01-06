import { ISimpleListCell } from "azure-devops-ui/List";
import { MenuItemType } from "azure-devops-ui/Menu";
import { ColumnMore, ISimpleTableCell } from "azure-devops-ui/Table";
import { renderExpandableTreeCell, renderTreeCell } from "azure-devops-ui/TreeEx";
import {
    ITreeItem,
    ITreeItemProvider,
    TreeItemProvider
} from "azure-devops-ui/Utilities/TreeItemProvider";
import { IReleasePath } from "./IReleasePath";
import { ReleaseDef } from "./ReleaseDef";

export function createItemProvider(items: ReleaseDef[]) {
    const rootItems: Array<ITreeItem<IReleasePath>> = [];

    items.forEach(item => {
        const pathParts  = getPathParts(item.path);

        

    });

    function getPathParts(path: string): string[] | undefined {
        if (path === '/') {
            return undefined;
        }

        return path.split('/');
    }
}


// export function getItemProvider(rootItemsCount: number): ITreeItemProvider<IReleasePath> {
//     const rootItems: Array<ITreeItem<IReleasePath>> = [];

//     // Build the set of items based on the current root item count.
//     for (let rootIndex = 0; rootIndex < rootItemsCount; rootIndex++) {
//         rootItems.push({
//             childItems: [
//                 { data: tableItems[1] },
//                 { childItems: [{ data: tableItems[3] }], data: tableItems[2], expanded: false }
//             ],
//             data: tableItems[0],
//             expanded: true
//         });
//     }

//     return new TreeItemProvider<ILocationTableItem>(rootItems);
// }