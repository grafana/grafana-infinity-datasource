package models

import "strings"

// normalizePEMContent normalizes line endings in a PEM-encoded string (private
// keys, certificates, CA bundles, etc.). It handles content stored with escaped
// line endings (e.g. from JSON files like Google Service Account credentials)
// as well as Windows-style CRLF or old Mac-style CR-only line endings.
func normalizePEMContent(s string) string {
	s = strings.ReplaceAll(s, `\r\n`, "\n") // escaped CRLF (e.g. from JSON files) → LF
	s = strings.ReplaceAll(s, `\n`, "\n")   // escaped LF → LF
	s = strings.ReplaceAll(s, `\r`, "")     // escaped standalone CR (e.g. old Mac line endings in escaped form) → strip
	s = strings.ReplaceAll(s, "\r\n", "\n") // actual CRLF (Windows line endings) → LF
	s = strings.ReplaceAll(s, "\r", "")     // actual standalone CR → strip
	return s
}
