// Заглушка для API клиента
// TODO: Реализовать полноценный API клиент

interface ApiResponse<T = any> {
  data: {
    success: boolean;
    data: T;
    message?: string;
  };
}

interface ApiClient {
  get<T = any>(url: string, config?: { params?: Record<string, any> }): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string): Promise<ApiResponse<T>>;
}

// Заглушка API клиента
export const apiClient: ApiClient = {
  async get<T>(url: string, config?: { params?: Record<string, any> }): Promise<ApiResponse<T>> {
    console.log('API GET:', url, config);
    throw new Error('API клиент не реализован');
  },

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    console.log('API POST:', url, data);
    throw new Error('API клиент не реализован');
  },

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    console.log('API PUT:', url, data);
    throw new Error('API клиент не реализован');
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    console.log('API DELETE:', url);
    throw new Error('API клиент не реализован');
  }
};

