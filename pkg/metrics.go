package main

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	PromRequestsTotal = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "infinity_plugin_requests_total",
		Help: "The total number of requests to the plugin",
	}, []string{"instanceID", "instanceUID", "instanceName", "type", "source", "format", "authType"})
)

var counters []prometheus.Collector = []prometheus.Collector{
	PromRequestsTotal,
}
