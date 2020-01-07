import { IStatusProps } from "azure-devops-ui/Status";
import { ISimpleTableCell } from "azure-devops-ui/Table";
import { IIconProps } from "azure-devops-ui/Icon";
import { ISimpleListCell } from "azure-devops-ui/List";

export interface IReleasePath {
    id: string;
    name: string;
    path: string;

    childItems: IReleasePath[];

    getStatus(): IStatusProps;

    getNameCell(): React.ReactNode;

    getStageCell(stage: string): React.ReactNode;
}
