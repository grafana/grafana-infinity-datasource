---
name: add-auth-type
description: "Add a new authentication type to the Infinity datasource plugin. Use when: implementing new auth method, adding authentication provider, extending auth support."
argument-hint: "Name of the new authentication type (e.g., 'NTLM', 'mTLS', 'SAML')"
---

# Add New Authentication Type

Add a new authentication type to the Grafana Infinity datasource plugin. This involves coordinated changes across the frontend (TypeScript/React) and backend (Go) codebases.

## When to Use

- Adding a new authentication method (e.g., NTLM, mTLS, SAML, custom token)
- Extending the plugin to support a new cloud provider's auth scheme
- Implementing a vendor-specific authentication flow

## Prerequisites

- Understand the auth protocol being added (headers, tokens, handshake, etc.)
- Know whether the auth requires: secrets, JSON config fields, or both
- Know whether the auth needs custom HTTP client/transport behavior

## Procedure

### Step 1: Define the Auth Type Constant and Types

**Frontend** — [src/types/config.types.ts](../../../src/types/config.types.ts):

1. Add the new value to the `AuthType` union type:
   ```ts
   export type AuthType = 'none' | 'basicAuth' | ... | 'yourNewAuth';
   ```
2. If the auth needs structured config, add a new props type:
   ```ts
   export type YourNewAuthProps = { /* config fields */ };
   ```
3. Add any new fields to `InfinityOptions` (non-secret JSON data) and `InfinitySecureOptions` (secrets stored encrypted).

**Backend** — [pkg/models/settings.go](../../../pkg/models/settings.go):

1. Add a new authentication method constant:
   ```go
   const AuthenticationMethodYourNewAuth = "yourNewAuth"
   ```
2. If the auth needs structured config, add a settings struct:
   ```go
   type YourNewAuthSettings struct { /* fields with json tags */ }
   ```
3. Add fields to `InfinitySettings` struct for runtime use.
4. Add fields to `InfinitySettingsJson` struct for JSON deserialization (must match frontend field names).
5. Update `LoadSettings()` to deserialize the new fields from `config.JSONData` and `config.DecryptedSecureJSONData`.

### Step 2: Add Validation

**Backend** — [pkg/models/settings.go](../../../pkg/models/settings.go):

1. Add error variables for validation:
   ```go
   var ErrInvalidConfigYourNewAuth = errors.New("invalid yourNewAuth configuration")
   ```
2. Add validation logic in `InfinitySettings.Validate()` method.
3. If the new auth type exempts allowed hosts requirement, update `DoesAllowedHostsRequired()`.

### Step 3: Create the Frontend Config Editor

**Frontend** — Create `src/editors/config/Auth.YourNewAuth.tsx`:

1. Create a React component for the auth-specific configuration form.
2. Use `LegacyForms.FormField` for regular fields and `LegacyForms.SecretFormField` for secrets.
3. Use `onUpdateDatasourceSecureJsonDataOption` helper for secret field changes.
4. Follow existing patterns from [Auth.AzureBlob.tsx](../../../src/editors/config/Auth.AzureBlob.tsx) or [OAuthInput.tsx](../../../src/editors/config/OAuthInput.tsx).

### Step 4: Register the Auth Type in the UI

**Frontend** — [src/editors/config/Auth.tsx](../../../src/editors/config/Auth.tsx):

1. Add entry to the `authTypes` array:
   ```ts
   { value: 'yourNewAuth', label: 'Your New Auth', logo: '/public/plugins/yesoreyeram-infinity-datasource/img/your-logo.png' },
   ```
2. Add case in `onAuthTypeChange` switch if the auth needs special handling (e.g., setting `basicAuth: true`).
3. Add the editor component in the render section:
   ```tsx
   {authType === 'yourNewAuth' && <YourNewAuthEditor {...props} />}
   ```

### Step 5: Implement Backend HTTP Client Auth

**Backend** — [pkg/httpclient/httpclient.go](../../../pkg/httpclient/httpclient.go):

1. Add a check function:
   ```go
   func isYourNewAuthConfigured(settings models.InfinitySettings) bool {
       return settings.AuthenticationMethod == models.AuthenticationMethodYourNewAuth
   }
   ```
2. Add an apply function that modifies the HTTP client or its transport:
   ```go
   func applyYourNewAuth(ctx context.Context, httpClient *http.Client, settings models.InfinitySettings) (*http.Client, error) { ... }
   ```
3. Call the apply function from `GetHTTPClient()`.
4. If this auth modifies the transport, update `applySecureSocksProxyConfiguration()` to unwrap it correctly.

### Step 6: Handle Auth Headers (if applicable)

**Backend** — [pkg/infinity/headers.go](../../../pkg/infinity/headers.go):

1. If the auth adds request headers (e.g., Authorization), add an `Apply*Auth` function.
2. Call it from the request pipeline where other auth headers are applied.

### Step 7: Write Tests

**Backend tests:**

- [pkg/models/settings_test.go](../../../pkg/models/settings_test.go): Add `LoadSettings` test cases for the new auth type.
- [pkg/httpclient/](../../../pkg/httpclient/): Add HTTP client configuration tests.
- Add validation test cases for both valid and invalid configurations.

**Frontend tests:**

- Create `src/editors/config/Auth.YourNewAuth.test.tsx` with rendering and interaction tests.
- Follow existing test patterns from [Auth.AzureBlob.test.tsx](../../../src/editors/config/Auth.AzureBlob.test.tsx).

### Step 8: Update Documentation

- Update [CHANGELOG.md](../../../CHANGELOG.md) with the new auth type.
- Add any required images/logos to `src/img/`.

## File Checklist

| File | Change |
|------|--------|
| `src/types/config.types.ts` | Add to `AuthType` union, add props type, add to `InfinityOptions`/`InfinitySecureOptions` |
| `pkg/models/settings.go` | Add constant, settings struct, fields, validation, deserialization |
| `src/editors/config/Auth.YourNewAuth.tsx` | New config editor component |
| `src/editors/config/Auth.tsx` | Register in `authTypes` array and render conditionally |
| `pkg/httpclient/httpclient.go` | Add HTTP client auth middleware |
| `pkg/infinity/headers.go` | Add auth headers (if needed) |
| `pkg/models/settings_test.go` | Backend settings tests |
| `src/editors/config/Auth.YourNewAuth.test.tsx` | Frontend editor tests |

## Tips

- Auth type string values must match exactly between frontend (`AuthType` union) and backend (`AuthenticationMethod*` constants).
- Secrets go in `secureJsonData` / `DecryptedSecureJSONData` — never in plain `jsonData`.
- The `onResetSecret` pattern is used for secret fields that can be reconfigured after initial save.
- If your auth modifies `httpClient.Transport`, ensure `applySecureSocksProxyConfiguration` can unwrap it.
- Run `make fmt` and `make lint` before committing.
