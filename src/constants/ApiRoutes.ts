const ApiRoutes = {
  // App-API routes (Skaftin SDK)
  APP_API: {
    COMMUNICATIONS: {
      SEND_SMS: '/app-api/communications/sms/send',
      SEND_SMS_BASIC: '/app-api/communications/sms/send-basic',
      SEND_EMAIL: '/app-api/communications/email/send',
      LIST_SMS_PROVIDERS: '/app-api/communications/sms/providers',
      GET_SMS_PROVIDER: (providerId: string) => `/app-api/communications/sms/providers/${providerId}`,
      CREATE_SMS_PROVIDER: '/app-api/communications/sms/providers',
      UPDATE_SMS_PROVIDER: (providerId: string) => `/app-api/communications/sms/providers/${providerId}`,
      DELETE_SMS_PROVIDER: (providerId: string) => `/app-api/communications/sms/providers/${providerId}`,
      LIST_SMS_TEMPLATES: '/app-api/communications/sms/templates',
      GET_SMS_TEMPLATE: (templateId: string) => `/app-api/communications/sms/templates/${templateId}`,
      CREATE_SMS_TEMPLATE: '/app-api/communications/sms/templates',
      UPDATE_SMS_TEMPLATE: (templateId: string) => `/app-api/communications/sms/templates/${templateId}`,
      DELETE_SMS_TEMPLATE: (templateId: string) => `/app-api/communications/sms/templates/${templateId}`,
    }
  }
}

export default ApiRoutes