export default function initDemo(config: any): Promise<void>;
/**
 * This is one example of how to import peer modules that works with webpack
 * It in fact just uses the default import from the browser, so it should work
 * on any standards compliant ecmascript environment.
 */
export function peerImport(moduleId: any): Promise<Window>;
