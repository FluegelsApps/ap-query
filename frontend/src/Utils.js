export function inTimeRange(time, timespan) {
    return (
        new Date().getTime() - time <= timespan || timespan == -1
    );
}