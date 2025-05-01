export const Components = {
  Common: {},
  ConfigEditor: {
    Auth: {
      AzureBlob: {
        Region: {
          label: 'Azure cloud',
          tooltip: 'Azure cloud type',
          ariaLabel: 'Azure cloud type',
        },
        StorageAccountName: {
          label: 'Storage account name',
          tooltip: 'Azure blob storage account name',
          placeholder: 'Azure blob storage account name',
          ariaLabel: 'Azure blob storage account name',
        },
        StorageAccountKey: {
          label: 'Storage account key',
          tooltip: 'Azure blob storage account key',
          placeholder: 'Azure blob storage account key',
          ariaLabel: 'Azure blob storage account key',
        },
      },
    },
  },
  QueryEditor: {
    Format: {
      Label: {
        Text: 'Format',
        Title: 'Format of the query',
      },
      Dropdown: {
        PlaceHolder: {
          Title: 'Format of the query - dropdown container',
        },
      },
    },
  },
  VariableEditor: {},
  AnnotationsEditor: {},
};
