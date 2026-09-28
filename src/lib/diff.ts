export interface SyncReport {
  componentName: string;
  manifestPath: string;
  ok: boolean;
  missingFromManifest: { properties: string[]; actions: string[] };
  staleInManifest: { properties: string[]; actions: string[] };
}

export function diffApis(
  componentName: string,
  manifestPath: string,
  code: { properties: string[]; dispatchedActions: string[] },
  manifest: { properties: string[]; actions: string[] }
): SyncReport {
  const codeProps = new Set(code.properties);
  const manifestProps = new Set(manifest.properties);
  const codeActions = new Set(code.dispatchedActions);
  const manifestActions = new Set(manifest.actions);

  const missingProps = [...codeProps].filter((p) => !manifestProps.has(p));
  const staleProps = [...manifestProps].filter((p) => !codeProps.has(p));
  const missingActions = [...codeActions].filter((a) => !manifestActions.has(a));
  const staleActions = [...manifestActions].filter((a) => !codeActions.has(a));

  return {
    componentName,
    manifestPath,
    ok: missingProps.length === 0 && missingActions.length === 0,
    missingFromManifest: { properties: missingProps, actions: missingActions },
    staleInManifest: { properties: staleProps, actions: staleActions }
  };
}
