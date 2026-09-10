package com.budgetplanner.service.impl;

import com.budgetplanner.dto.response.BankSyncResultResponse;
import com.budgetplanner.entity.Expense;
import com.budgetplanner.entity.ExpenseCategory;
import com.budgetplanner.entity.Income;
import com.budgetplanner.entity.User;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.repository.ExpenseRepository;
import com.budgetplanner.repository.IncomeRepository;
import com.budgetplanner.service.BankSyncService;
import com.budgetplanner.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankSyncServiceImpl implements BankSyncService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE, // 2026-09-10
            DateTimeFormatter.ofPattern("dd/MM/yyyy"), // 10/09/2026
            DateTimeFormatter.ofPattern("d/M/yyyy"),   // 1/9/2026
            DateTimeFormatter.ofPattern("dd-MM-yyyy"), // 10-09-2026
            DateTimeFormatter.ofPattern("d-M-yyyy"),   // 1-9-2026
            new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("dd-MMM-yyyy").toFormatter(Locale.ENGLISH), // 10-Sep-2026
            new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("d-MMM-yyyy").toFormatter(Locale.ENGLISH),  // 1-Sep-2026
            new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("dd/MMM/yyyy").toFormatter(Locale.ENGLISH), // 10/Sep/2026
            DateTimeFormatter.ofPattern("MM/dd/yyyy"), // 09/10/2026
            DateTimeFormatter.ofPattern("yyyy/MM/dd")  // 2026/09/10
    };

    @Override
    @Transactional
    public BankSyncResultResponse simulateBankSync(String bankName) {
        User user = SecurityUtils.getCurrentUser();
        Long userId = user.getId();
        String activeBank = (bankName != null && !bankName.isBlank()) ? bankName : "HDFC Bank Sandbox";

        log.info("Executing simulated bank sync for user id: {} with bank: {}", userId, activeBank);

        LocalDate today = LocalDate.now();
        List<RawTx> mockFeed = generateMockFeed(today);

        return processTransactions(user, activeBank, mockFeed);
    }

    @Override
    @Transactional
    public BankSyncResultResponse importCsvStatement(MultipartFile file) {
        User user = SecurityUtils.getCurrentUser();
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CSV file is empty or not provided");
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "statement.csv";
        log.info("Importing bank statement CSV for user id: {}, file: {}", user.getId(), fileName);

        List<RawTx> parsed = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;

            // Column index tracking
            int dateIdx = -1;
            int descIdx = -1;
            int debitIdx = -1;
            int creditIdx = -1;
            int amountIdx = -1;
            int typeIdx = -1;
            int categoryIdx = -1;
            boolean hasHeader = false;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;

                String[] rawTokens = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                List<String> tokens = new ArrayList<>();
                for (String t : rawTokens) {
                    tokens.add(t.replaceAll("^\"|\"$", "").trim());
                }

                if (isFirstLine) {
                    isFirstLine = false;
                    // Analyze header names
                    for (int i = 0; i < tokens.size(); i++) {
                        String col = tokens.get(i).toLowerCase();
                        if (col.contains("date") || col.contains("txn date") || col.contains("value date")) {
                            if (dateIdx == -1) dateIdx = i;
                        } else if (col.contains("narration") || col.contains("description") || col.contains("particular") ||
                                   col.contains("remark") || col.contains("details") || col.contains("payee") || col.contains("source")) {
                            if (descIdx == -1) descIdx = i;
                        } else if (col.contains("debit") || col.contains("withdrawal") || col.contains("withdraw") ||
                                   col.contains("dr") || col.contains("expense") || col.contains("spent") || col.contains("paid out")) {
                            if (debitIdx == -1) debitIdx = i;
                        } else if (col.contains("credit") || col.contains("deposit") || col.contains("cr") ||
                                   col.contains("income") || col.contains("received") || col.contains("paid in")) {
                            if (creditIdx == -1) creditIdx = i;
                        } else if (col.contains("amount") || col.contains("txn amount")) {
                            if (amountIdx == -1) amountIdx = i;
                        } else if (col.contains("type") || col.contains("cr/dr") || col.contains("cr_dr") || col.contains("d/c")) {
                            if (typeIdx == -1) typeIdx = i;
                        } else if (col.contains("category")) {
                            if (categoryIdx == -1) categoryIdx = i;
                        }
                    }

                    if (dateIdx != -1 && (descIdx != -1 || amountIdx != -1 || debitIdx != -1 || creditIdx != -1)) {
                        hasHeader = true;
                        log.info("Detected CSV header: date={}, desc={}, debit={}, credit={}, amount={}, type={}",
                                dateIdx, descIdx, debitIdx, creditIdx, amountIdx, typeIdx);
                        continue; // skip header row
                    } else {
                        // Not a recognized header row, process as first data row with positional fallback
                        hasHeader = false;
                    }
                }

                // If no recognized header was found, establish standard positional indices based on column count
                if (!hasHeader && dateIdx == -1) {
                    dateIdx = 0;
                    descIdx = 1;
                    if (tokens.size() >= 5) {
                        // Standard bank: Date, Narration, Debit, Credit, Balance
                        debitIdx = 2;
                        creditIdx = 3;
                    } else if (tokens.size() == 4) {
                        // Date, Description, Amount, Type
                        amountIdx = 2;
                        typeIdx = 3;
                    } else if (tokens.size() == 3) {
                        // Date, Description, Amount
                        amountIdx = 2;
                    }
                }

                try {
                    String dateStr = (dateIdx >= 0 && dateIdx < tokens.size()) ? tokens.get(dateIdx) : "";
                    String desc = (descIdx >= 0 && descIdx < tokens.size()) ? tokens.get(descIdx) : "Transaction";
                    if (desc.isBlank()) desc = "Transaction";

                    LocalDate date = parseDate(dateStr);
                    if (date == null) continue; // skip unparseable date rows

                    // Parse financial direction: DEBIT (Expense) vs CREDIT (Income)
                    BigDecimal debitAmt = parseAmountSafe(debitIdx >= 0 && debitIdx < tokens.size() ? tokens.get(debitIdx) : "");
                    BigDecimal creditAmt = parseAmountSafe(creditIdx >= 0 && creditIdx < tokens.size() ? tokens.get(creditIdx) : "");

                    if (debitAmt != null && debitAmt.compareTo(BigDecimal.ZERO) > 0) {
                        // Definite Debit -> EXPENSE
                        parsed.add(new RawTx(date, desc, debitAmt, "EXPENSE"));
                    } else if (creditAmt != null && creditAmt.compareTo(BigDecimal.ZERO) > 0) {
                        // Definite Credit -> INCOME
                        parsed.add(new RawTx(date, desc, creditAmt, "INCOME"));
                    } else if (amountIdx >= 0 && amountIdx < tokens.size()) {
                        String rawAmtStr = tokens.get(amountIdx);
                        BigDecimal amt = parseAmountSafe(rawAmtStr);
                        if (amt != null && amt.compareTo(BigDecimal.ZERO) > 0) {
                            String typeStr = (typeIdx >= 0 && typeIdx < tokens.size()) ? tokens.get(typeIdx).toUpperCase() : "";

                            boolean isIncome = false;
                            if (!typeStr.isBlank()) {
                                isIncome = typeStr.contains("CR") || typeStr.contains("CREDIT") ||
                                           typeStr.contains("INC") || typeStr.contains("DEP") || typeStr.contains("INCOME");
                            } else if (rawAmtStr.startsWith("-")) {
                                isIncome = false;
                            } else if (rawAmtStr.startsWith("+")) {
                                isIncome = true;
                            } else {
                                // Keyword detection for income vs expense
                                isIncome = isIncomeKeyword(desc);
                            }

                            parsed.add(new RawTx(date, desc, amt, isIncome ? "INCOME" : "EXPENSE"));
                        }
                    }
                } catch (Exception e) {
                    log.warn("Skipping line due to parse error: {}", line);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse bank statement CSV", e);
            throw new BadRequestException("Failed to parse CSV file: " + e.getMessage());
        }

        if (parsed.isEmpty()) {
            throw new BadRequestException("No valid transactions found in CSV. Please verify that columns include Date, Description, and Amount/Debit/Credit.");
        }

        return processTransactions(user, fileName, parsed);
    }

    private BankSyncResultResponse processTransactions(User user, String sourceName, List<RawTx> transactions) {
        Long userId = user.getId();
        int imported = 0;
        int skipped = 0;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal totalIncomes = BigDecimal.ZERO;
        List<BankSyncResultResponse.ImportedItem> items = new ArrayList<>();

        // In-batch deduplication set to avoid inserting repeated entries present within the same CSV
        Set<String> processedInBatch = new HashSet<>();

        for (RawTx tx : transactions) {
            boolean isIncome = "INCOME".equalsIgnoreCase(tx.type());
            String normDesc = tx.description().trim().replaceAll("\\s+", " ").toLowerCase();
            String batchKey = (isIncome ? "INC" : "EXP") + "|" + tx.date() + "|" + tx.amount().stripTrailingZeros().toPlainString() + "|" + normDesc;

            // Check 1: In-batch duplicate
            if (processedInBatch.contains(batchKey)) {
                skipped++;
                continue;
            }
            processedInBatch.add(batchKey);

            if (isIncome) {
                // Check 2: Database duplicate check for Incomes on that date
                boolean dbExists = incomeRepository.findByUserIdAndDateBetween(userId, tx.date(), tx.date()).stream()
                        .anyMatch(i -> i.getAmount().compareTo(tx.amount()) == 0 &&
                                       i.getSource().trim().replaceAll("\\s+", " ").equalsIgnoreCase(tx.description().trim().replaceAll("\\s+", " ")));

                if (dbExists) {
                    skipped++;
                } else {
                    Income income = Income.builder()
                            .user(user)
                            .source(tx.description().trim())
                            .amount(tx.amount())
                            .date(tx.date())
                            .recurring(false)
                            .build();
                    incomeRepository.save(income);
                    imported++;
                    totalIncomes = totalIncomes.add(tx.amount());
                    items.add(new BankSyncResultResponse.ImportedItem(
                            tx.date().toString(), tx.description().trim(), tx.amount(), "INCOME", "INCOME"));
                }
            } else {
                // Check 3: Database duplicate check for Expenses on that date
                boolean dbExists = expenseRepository.findByUserIdAndDateBetween(userId, tx.date(), tx.date()).stream()
                        .anyMatch(e -> e.getAmount().compareTo(tx.amount()) == 0 &&
                                       e.getDescription().trim().replaceAll("\\s+", " ").equalsIgnoreCase(tx.description().trim().replaceAll("\\s+", " ")));

                if (dbExists) {
                    skipped++;
                } else {
                    ExpenseCategory category = autoCategorize(tx.description());
                    Expense expense = Expense.builder()
                            .user(user)
                            .description(tx.description().trim())
                            .amount(tx.amount())
                            .date(tx.date())
                            .category(category)
                            .recurring(false)
                            .build();
                    expenseRepository.save(expense);
                    imported++;
                    totalExpenses = totalExpenses.add(tx.amount());
                    items.add(new BankSyncResultResponse.ImportedItem(
                            tx.date().toString(), tx.description().trim(), tx.amount(), "EXPENSE", category.name()));
                }
            }
        }

        String msg = String.format("Bank statement imported: %d transactions processed (%d imported, %d duplicates skipped).",
                imported + skipped, imported, skipped);

        return BankSyncResultResponse.builder()
                .sourceName(sourceName)
                .importedCount(imported)
                .skippedDuplicatesCount(skipped)
                .totalExpensesAdded(totalExpenses)
                .totalIncomesAdded(totalIncomes)
                .message(msg)
                .items(items)
                .build();
    }

    private boolean isIncomeKeyword(String desc) {
        String d = desc.toLowerCase();
        return d.contains("salary") || d.contains("payroll") || d.contains("deposit") ||
               d.contains("dividend") || d.contains("interest") || d.contains("cashback") ||
               d.contains("refund") || d.contains("reimbursement") || d.contains("freelance") ||
               d.contains("bonus") || d.contains("stipend") || d.contains("credit");
    }

    private BigDecimal parseAmountSafe(String str) {
        if (str == null) return null;
        String cleaned = str.replaceAll("[\"₹$€£, ]", "").trim();
        if (cleaned.isEmpty() || cleaned.equals("-") || cleaned.equals("+")) return null;
        try {
            BigDecimal val = new BigDecimal(cleaned);
            return val.abs();
        } catch (Exception e) {
            return null;
        }
    }

    private ExpenseCategory autoCategorize(String description) {
        String d = description.toLowerCase();
        if (d.contains("swiggy") || d.contains("zomato") || d.contains("starbucks") ||
            d.contains("mcdonald") || d.contains("groceries") || d.contains("supermarket") ||
            d.contains("blinkit") || d.contains("zepto") || d.contains("restaurant") || d.contains("food")) {
            return ExpenseCategory.FOOD;
        }
        if (d.contains("uber") || d.contains("ola") || d.contains("metro") ||
            d.contains("petrol") || d.contains("fuel") || d.contains("shell") || d.contains("flight")) {
            return ExpenseCategory.TRANSPORTATION;
        }
        if (d.contains("netflix") || d.contains("spotify") || d.contains("cinema") ||
            d.contains("movie") || d.contains("bookmyshow") || d.contains("prime")) {
            return ExpenseCategory.ENTERTAINMENT;
        }
        if (d.contains("electricity") || d.contains("water") || d.contains("bescom") ||
            d.contains("wifi") || d.contains("airtel") || d.contains("jio") || d.contains("broadband")) {
            return ExpenseCategory.UTILITIES;
        }
        if (d.contains("rent") || d.contains("landlord") || d.contains("maintenance")) {
            return ExpenseCategory.HOUSING;
        }
        if (d.contains("pharmacy") || d.contains("hospital") || d.contains("apollo") || d.contains("medical")) {
            return ExpenseCategory.HEALTHCARE;
        }
        if (d.contains("amazon") || d.contains("flipkart") || d.contains("myntra") || d.contains("zara")) {
            return ExpenseCategory.CLOTHING;
        }
        return ExpenseCategory.OTHER;
    }

    private List<RawTx> generateMockFeed(LocalDate today) {
        List<RawTx> list = new ArrayList<>();
        list.add(new RawTx(today.minusDays(1), "Swiggy Online Food Order", new BigDecimal("480.00"), "EXPENSE"));
        list.add(new RawTx(today.minusDays(2), "Uber Ride Payment", new BigDecimal("240.00"), "EXPENSE"));
        list.add(new RawTx(today.minusDays(3), "Blinkit Grocery Delivery", new BigDecimal("920.00"), "EXPENSE"));
        list.add(new RawTx(today.minusDays(4), "Netflix Monthly Subscription", new BigDecimal("649.00"), "EXPENSE"));
        list.add(new RawTx(today.minusDays(5), "Shell Petrol Pump Fuel", new BigDecimal("1200.00"), "EXPENSE"));
        list.add(new RawTx(today.minusDays(6), "Freelance Design Payout", new BigDecimal("8500.00"), "INCOME"));
        return list;
    }

    private LocalDate parseDate(String str) {
        if (str == null || str.isBlank()) return null;
        String clean = str.replaceAll("\"", "").trim();
        for (DateTimeFormatter fmt : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(clean, fmt);
            } catch (Exception ignored) {}
        }
        log.warn("Could not parse date: '{}'", clean);
        return null;
    }

    private record RawTx(LocalDate date, String description, BigDecimal amount, String type) {}
}
