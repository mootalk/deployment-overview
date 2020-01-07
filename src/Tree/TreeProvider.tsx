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
import { ReleaseDef } from "../Data/ReleaseDef";
import { ReleaseDefinitionEnvironment, Release } from "azure-devops-extension-api/Release/Release";
import { Folder } from "./Folder";
import { SimpleTreeItem } from "./SimpleTreeItem";


export class TreeProvider {
    private rootItems: Array<IReleasePath> = [];
    private definitions: ReleaseDef[];
    private stages: string[];

    public getItemProvider(): ITreeItemProvider<SimpleTreeItem>{
        const items: ITreeItem<SimpleTreeItem>[] = this.rootItems.map(item => this.convert(item));

        return new TreeItemProvider(items);
    }

    private convert(item: IReleasePath): ITreeItem<SimpleTreeItem>{
        var childItems: ITreeItem<SimpleTreeItem>[] | undefined;

        if (item.childItems.length !== 0){
            childItems = item.childItems.map(child => this.convert(child))
        }

        return {
            expanded: false,
            data: SimpleTreeItem.createFrom(item, this.stages),
            childItems: childItems
        }
    }

    constructor(items: ReleaseDef[], stages: string[]) {
        this.definitions = items;
        this.stages = stages;

        this.initializeRootItems();
    }

    private initializeRootItems(): void {
        this.definitions.forEach(item => {
            const folders = this.createFoldersForPath(item.path);
            var lastFolder: IReleasePath | undefined;
            folders.forEach(folder => {
                if (this.folderExists(folder)) {
                    lastFolder = this.getFolder(folder);
                } else {
                    const parent = lastFolder;

                    if (parent) {
                        parent.childItems.push(folder);
                    } else {
                        this.rootItems.push(folder);
                    }

                    lastFolder = folder
                }
            });

            if (lastFolder) {
                lastFolder.childItems.push(item);
            } else {
                this.rootItems.push(item);
            }
        });
    }

    private createFoldersForPath(path: string): Folder[] {
        const folders: Folder[] = [];
        const parts = path.split('\\');
        var newPath: string | undefined;
        for (let index = 1; index < parts.length; index++) {
            const part = parts[index];

            folders.push(new Folder(part, newPath ?? '\\'));

            newPath += `\\${part}`;
        }

        return folders;
    }

    private getFolder(folder: Folder): IReleasePath {
        return this.rootItems.filter(item => item.id == folder.id)[0];
    }

    private folderExists(folder: Folder): boolean {
        return this.rootItems.some(item => item.id == folder.id);
    }
}