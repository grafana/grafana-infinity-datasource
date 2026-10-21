# Development tools

`go.mod` and `go.sum` pin golangci-lint v2.15.0 separately from the plugin's
runtime dependencies. CI and CD workflows use the same version.

Install the pinned linter from the repository root:

```sh
go -C tools install github.com/golangci/golangci-lint/v2/cmd/golangci-lint
```

Then run it from the repository root (ensure `$(go env GOPATH)/bin` is on `PATH`):

```sh
golangci-lint run ./pkg/...
```

To update the tool, run `go -C tools get -tool` with the new version, then
`go -C tools mod tidy`, and update every CI/CD `golangci-lint-version` pin.
