package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.response.BankSyncResultResponse;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.BankSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(AppConstants.BANK_SYNC_BASE)
@RequiredArgsConstructor
@Tag(name = "Bank Sync", description = "Automated bank statement sync and CSV transaction ingestion")
@SecurityRequirement(name = "bearerAuth")
public class BankSyncController {

    private final BankSyncService bankSyncService;

    @Operation(summary = "Simulate live bank feed sync with auto-categorization and deduplication")
    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<BankSyncResultResponse>> simulateBankSync(
            @RequestParam(defaultValue = "HDFC Bank Sandbox") String bankName) {
        BankSyncResultResponse result = bankSyncService.simulateBankSync(bankName);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @Operation(summary = "Upload and import bank statement CSV file")
    @PostMapping(value = "/upload-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BankSyncResultResponse>> uploadCsv(
            @RequestParam("file") MultipartFile file) {
        BankSyncResultResponse result = bankSyncService.importCsvStatement(file);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }
}
