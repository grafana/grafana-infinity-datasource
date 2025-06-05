const RFC_2396_warning =
  '"is NOT RECOMMENDED, because the passing of authentication information in clear text (such as URI) has proven to be a security risk in almost every case where it has been used."';

export const Components = {
  Common: {},
  ConfigEditor: {
    Auth: {
      OAuth2: {
        TokenHeader: {
          label: 'Custom Token Header',
          tooltip: `Once the token retrieved, the same will be sent to subsequent request's header with the key "Authorization". If the API require different key, provide the key here. Defaults to Authorization`,
          placeholder: 'Authorization',
        },
        TokenPrefix: {
          label: 'Custom Token Prefix',
          tooltip: `Once the token retrieved, the same will be sent to subsequent request's Authorization header with the prefix "Bearer " or whatever returned from the initial token retrieval request's response. If the API require different prefix, provide the prefix here. Refer https://datatracker.ietf.org/doc/html/rfc6749#section-7.1 for more details. Defaults to Bearer`,
          placeholder: 'Bearer',
        },
        SkipSpace: {
          label: 'Skip Space in Token',
          tooltip: 'If selected, space between token prefix and token will be skipped',
        },
      },
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
    Network: {
      Proxy: {
        ProxyCustomURL: {
          URL: {
            label: 'Proxy URL',
            tooltip: `Proxy URL. Don't set the username or password here`,
            placeholder: 'Example: https://localhost:3004',
            ariaLabel: 'Proxy URL',
          },
          UserName: {
            label: 'Proxy User Name',
            tooltip: `Optional: Proxy Username.
This functionality should only be used with legacy web sites. 
RFC 2396 warns that interpreting Userinfo this way 
${RFC_2396_warning}`,
            placeholder: 'Example: foo',
            ariaLabel: 'Proxy Username',
          },
          Password: {
            label: 'Proxy Password',
            tooltip: `Optional: Proxy Password.
This functionality should only be used with legacy web sites. 
RFC 2396 warns that interpreting Userinfo this way 
${RFC_2396_warning}`,
            placeholder: 'Proxy Password',
            ariaLabel: 'Proxy Password',
          },
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
