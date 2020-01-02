import { Status } from "azure-devops-ui/Status";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import { ReleaseDef } from './ReleaseDef';
import React from "react";

export class ReleaseColumn {
    id: string;
    name: string;
    width: number;
    constructor() {
        this.id = 'name';
        this.name = 'Name';
        this.width = 300;
    }
    public renderCell(rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ReleaseDef>, tableItem: ReleaseDef): JSX.Element {
        return <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn} key={"col-" + columnIndex} contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden">

            <Status {...tableItem.getStatus()} className="icon-large-margin" />

            <div className="flex-row scroll-hidden">
                <Tooltip overflowOnly={true}>
                    <span className="text-ellipsis">{tableItem.name}</span>
                </Tooltip>
            </div>
        </SimpleTableCell>;
    }
}
