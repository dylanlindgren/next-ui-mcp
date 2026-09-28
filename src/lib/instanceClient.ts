export interface InstanceConfig {
  baseUrl: string;
  authHeader: string;
}

/**
 * Reads the target ServiceNow instance's URL and credentials from environment
 * variables ONLY — never from tool-call arguments — so they never pass through
 * the LLM's visible context or get logged as part of a tool call.
 *
 * Configure in the MCP client's server config, e.g.:
 *   "env": {
 *     "NEXT_UI_INSTANCE_URL": "https://my-instance.service-now.com",
 *     "NEXT_UI_INSTANCE_USER": "...",
 *     "NEXT_UI_INSTANCE_PASSWORD": "..."
 *   }
 * or NEXT_UI_INSTANCE_TOKEN instead of USER/PASSWORD for bearer-token auth.
 */
export function getInstanceConfig(): InstanceConfig {
  const baseUrl = process.env.NEXT_UI_INSTANCE_URL;
  if (!baseUrl) {
    throw new Error(
      'NEXT_UI_INSTANCE_URL is not set. Configure NEXT_UI_INSTANCE_URL and either ' +
        'NEXT_UI_INSTANCE_TOKEN, or both NEXT_UI_INSTANCE_USER and NEXT_UI_INSTANCE_PASSWORD, ' +
        "as environment variables in your MCP client's server config."
    );
  }

  const trimmedBaseUrl = baseUrl.replace(/\/+$/, '');

  const token = process.env.NEXT_UI_INSTANCE_TOKEN;
  if (token) {
    return { baseUrl: trimmedBaseUrl, authHeader: `Bearer ${token}` };
  }

  const user = process.env.NEXT_UI_INSTANCE_USER;
  const password = process.env.NEXT_UI_INSTANCE_PASSWORD;
  if (!user || !password) {
    throw new Error(
      'No instance credentials configured. Set NEXT_UI_INSTANCE_TOKEN, or both ' +
        'NEXT_UI_INSTANCE_USER and NEXT_UI_INSTANCE_PASSWORD, as environment variables.'
    );
  }

  const basic = Buffer.from(`${user}:${password}`).toString('base64');
  return { baseUrl: trimmedBaseUrl, authHeader: `Basic ${basic}` };
}

/** GETs a ServiceNow Table API resource and returns its `result` array. */
export async function tableApiGet(
  config: InstanceConfig,
  table: string,
  params: Record<string, string>
): Promise<any[]> {
  const url = new URL(`${config.baseUrl}/api/now/table/${table}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: config.authHeader,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Instance request failed (${response.status}) for ${table}: ${body.slice(0, 300)}`);
  }

  const json = (await response.json()) as { result?: any[] };
  return json.result ?? [];
}
