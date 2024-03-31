package pluginhost

import (
	"context"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/service"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func checkHealthAzureBlobStorage(ctx context.Context, client *instanceSettings) (*backend.CheckHealthResult, error) {
	if client == nil {
		return healthCheckError("invalid client")
	}
	if client.client == nil {
		return healthCheckError("invalid infinity client")
	}
	if client.client.AzureBlobClient == nil {
		return healthCheckError("invalid azure blob client")
	}
	blobServiceClient := client.client.AzureBlobClient.ServiceClient()
	if blobServiceClient == nil {
		return healthCheckError("invalid azure blob service client. check storage account name and key")
	}
	if _, err := blobServiceClient.GetAccountInfo(ctx, &service.GetAccountInfoOptions{}); err != nil {
		if strings.Contains(err.Error(), "no such host") {
			return healthCheckError("error connecting to blob storage. invalid blog storage name")
		}
		if strings.Contains(err.Error(), "RESPONSE 403") {
			return healthCheckError("error connecting to blob storage. http 403. check blob storage key")
		}
		if strings.Contains(err.Error(), "RESPONSE 500") {
			return healthCheckError("error connecting to blob storage. http 500")
		}
		return healthCheckError("error connecting to blob storage. check grafana logs for more details")
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusOk, Message: "OK"}, nil
}
