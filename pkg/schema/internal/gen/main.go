// Command gen writes the Infinity data source plugin schema to its JSON artifact.
// It is invoked via `go generate ./pkg/schema`.
package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/grafana/grafana-infinity-datasource/pkg/schema"
)

func main() {
	data, err := schema.Marshal()
	if err != nil {
		log.Fatalf("marshal schema: %v", err)
	}
	if err := os.MkdirAll(filepath.Dir(schema.OutputPath), 0o750); err != nil {
		log.Fatalf("create output dir: %v", err)
	}
	if err := os.WriteFile(schema.OutputPath, data, 0o600); err != nil {
		log.Fatalf("write schema: %v", err)
	}
	log.Printf("wrote %s", schema.OutputPath)
}
