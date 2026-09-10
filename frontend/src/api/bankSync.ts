import api from './axios'
import type { ApiResponse, BankSyncResultResponse } from '../types'

export const bankSyncApi = {
  simulateBankSync: (bankName: string = 'HDFC Bank Sandbox') =>
    api.post<ApiResponse<BankSyncResultResponse>>(`/bank-sync/simulate?bankName=${encodeURIComponent(bankName)}`),

  uploadCsv: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<BankSyncResultResponse>>('/bank-sync/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
