import { Statuses, IStatusProps } from "azure-devops-ui/Status";
import { Environment } from "./Environment";

export function aggregateStatusesFromEnvironments(environments: Environment[]): IStatusProps {
    const states = environments.map(env => env.getStatus());

    return aggregateStatuses(states);
}

export function aggregateStatuses(states: IStatusProps[]): IStatusProps {
    const allStatuses = getDistinctStatuses(states);
    if (allStatuses.length === 1) {
        return allStatuses[0];
    }
    if (allStatuses.every(s => s === Statuses.Success)) {
        return Statuses.Success;
    }
    if (contains(allStatuses, Statuses.Running)) {
        return Statuses.Running;
    }
    if (contains(allStatuses, Statuses.Failed)) {
        return Statuses.Failed;
    }
    if (contains(allStatuses, Statuses.Warning)) {
        return Statuses.Warning;
    }
    if (contains(allStatuses, Statuses.Waiting)) {
        return Statuses.Waiting;
    }
    return Statuses.Waiting;

    function getDistinctStatuses(states: IStatusProps[]): IStatusProps[] {
        return states
            .filter(distinct);

        function distinct(value: IStatusProps, index: number, self: IStatusProps[]): boolean {
            return self.indexOf(value) === index;
        }
    }

    function contains(array: IStatusProps[], expected: IStatusProps) {
        return array.some(item => item === expected);
    }
}