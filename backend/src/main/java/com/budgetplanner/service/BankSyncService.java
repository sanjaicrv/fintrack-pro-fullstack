package com.budgetplanner.service;

import com.budgetplanner.dto.response.BankSyncResultResponse;
import org.springframework.web.multipart.MultipartFile;

public interface BankSyncService {

    BankSyncResultResponse simulateBankSync(String bankName);

    BankSyncResultResponse importCsvStatement(MultipartFile file);
}
