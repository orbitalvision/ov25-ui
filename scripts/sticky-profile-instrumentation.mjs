// Browser-response-only timing probes. Does not edit the runtime or dist.
const markers = [
 ['headerDiscovery','    const viewportHeight = viewportHeightForWindow(windowObject);'],
 ['headerGeometry','    reconnectHeaderMotionListeners(headerResolution.elements);'],
 ['ancestors','    const ancestorState = inspectAndRepairHostAncestors(headerOffset + gaps.top);'],
 ['observers','    reconnectResizeObserver(['],
 ['sizes','    const nextSnapshot = {'],
 ['cssAndGeometry','    const variables = {'],
 ['publish','    const changed = !hasMeasured || !sameSnapshot(snapshot, nextSnapshot);'],
];
export function instrumentStickyController(code) {
 const start = code.indexOf('  const measure = () => {');
 const end = code.indexOf('  const scheduleMeasure = ', start);
 if(start<0||end<0) throw Error('Measure boundaries not found');
 let part = code.slice(start,end);
 part=part.replace('    if (!started || destroyed) return;',`    if (!started || destroyed) return;
    const __p = window.__stickyProfile;
    const __times = []; const __mark = n => __times.push([n, performance.now()]);
    __mark('start');`);
 for(const [label,marker] of markers) {
  if(!part.includes(marker)) throw Error('Missing marker '+label);
  part=part.replace(marker,`    __mark('${label}');\n${marker}`);
 }
 part=part.replace('    const shouldMeasureAgain = measureAfterCurrentFrame;',`    __mark('end');
    if (__p) __p.rows.push(__times);
    const shouldMeasureAgain = measureAfterCurrentFrame;`);
 return code.slice(0,start)+part+code.slice(end);
}
