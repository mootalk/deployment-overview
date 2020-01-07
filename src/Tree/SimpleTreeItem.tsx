import { ISimpleTableCell } from "azure-devops-ui/Table";
import { ISimpleListCell } from "azure-devops-ui/List";
import { IReleasePath } from "./IReleasePath";

export class SimpleTreeItem implements ISimpleTableCell {
    [prop: string]: string | number | ISimpleListCell;

    public static createFrom(releasePath: IReleasePath, stages: string[]): SimpleTreeItem {
        return {
            name: releasePath.name,
            Dev: {textNode: releasePath.getStageCell("Dev")},
            Systemtest: {textNode: releasePath.getStageCell("Systemtest")},
            Test: {textNode: releasePath.getStageCell("Test")},
            Prod: {textNode: releasePath.getStageCell("Prod")}
        }
    }
}