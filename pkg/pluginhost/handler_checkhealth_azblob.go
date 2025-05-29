package pluginhost

import (
	"context"
	"errors"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/service"
	"github.com/grafana/grafana-infinity-datasource/pkg/infinity"
	"github.com/grafana/grafana-infinity-datasource/pkg/models"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func checkHealthAzureBlobStorage(ctx context.Context, client *infinity.Client) (*backend.CheckHealthResult, error) {
	if client == nil {
		return healthCheckError("", models.ErrInvalidInfinityClient.Error(), "")
	}
	blobServiceClient := client.AzureBlobClient.ServiceClient()
	if blobServiceClient == nil {
		return healthCheckError("", models.ErrInvalidAzBlobClient.Error(), "")
	}
	if _, err := blobServiceClient.GetAccountInfo(ctx, &service.GetAccountInfoOptions{}); err != nil {
		if strings.Contains(err.Error(), "no such host") {
			return healthCheckError("", errors.Join(models.ErrConnectingAzBlobAccount, models.ErrInvalidAzBlobStorageName).Error(), "")
		}
		if strings.Contains(err.Error(), "RESPONSE 403") {
			return healthCheckError("", errors.Join(models.ErrConnectingAzBlobAccount, models.ErrAzBlob403).Error(), "")
		}
		if strings.Contains(err.Error(), "RESPONSE 500") {
			return healthCheckError("", errors.Join(models.ErrConnectingAzBlobAccount, models.ErrAzBlob500).Error(), "")
		}
		return healthCheckError("", "error connecting to blob storage", "")
	}
	return &backend.CheckHealthResult{Status: backend.HealthStatusOk, Message: "OK"}, nil
}
