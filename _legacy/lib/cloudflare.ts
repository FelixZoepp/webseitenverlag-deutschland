interface CloudflareCredentials {
  accountId: string
  apiToken: string
}

interface DeployResult {
  success: boolean
  url?: string
  error?: string
}

export async function createPagesProject(
  credentials: CloudflareCredentials,
  projectName: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/pages/projects`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        production_branch: 'main',
      }),
    }
  )

  const data = await res.json()

  if (!data.success) {
    if (data.errors?.[0]?.code === 8000009) {
      return { success: true }
    }
    return { success: false, error: data.errors?.[0]?.message || 'Unknown error' }
  }

  return { success: true }
}

export async function deployToCloudflarePages(
  credentials: CloudflareCredentials,
  projectName: string,
  htmlContent: string
): Promise<DeployResult> {
  const form = new FormData()
  const blob = new Blob([htmlContent], { type: 'text/html' })
  form.append('index.html', blob, 'index.html')

  return deployFormData(credentials, projectName, form)
}

export async function deployMultiPageToCloudflare(
  credentials: CloudflareCredentials,
  projectName: string,
  files: { path: string; content: string }[]
): Promise<DeployResult> {
  const form = new FormData()

  for (const file of files) {
    const blob = new Blob([file.content], { type: 'text/html' })
    form.append(file.path, blob, file.path)
  }

  return deployFormData(credentials, projectName, form)
}

async function deployFormData(
  credentials: CloudflareCredentials,
  projectName: string,
  form: FormData
): Promise<DeployResult> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/pages/projects/${projectName}/deployments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
      },
      body: form,
    }
  )

  const data = await res.json()

  if (!data.success) {
    return {
      success: false,
      error: data.errors?.[0]?.message || 'Deploy failed',
    }
  }

  return {
    success: true,
    url: data.result?.url || `https://${projectName}.pages.dev`,
  }
}
