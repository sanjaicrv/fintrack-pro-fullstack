package com.budgetplanner.service.impl;

import com.budgetplanner.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @Override
    @Async
    public void sendOtpEmail(String to, String otp) {
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            log.info("Sending OTP email via Brevo HTTP API to {}", to);
            sendViaBrevo(to, otp);
        } else {
            log.info("Sending OTP email via JavaMail SMTP to {}", to);
            sendViaSmtp(to, otp);
        }
    }

    private void sendViaBrevo(String to, String otp) {
        try {
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            Map<String, Object> body = new HashMap<>();
            
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "FinTrack Pro");
            sender.put("email", fromEmail);
            body.put("sender", sender);

            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);
            body.put("to", List.of(recipient));

            body.put("subject", "FinTrack Pro - Password Reset OTP");
            
            String htmlContent = "<h3>Dear User,</h3>"
                    + "<p>You requested a password reset for your FinTrack Pro account.</p>"
                    + "<p>Your One-Time Password (OTP) is: <strong style='font-size: 1.2em; color: #7c3aed;'>" + otp + "</strong></p>"
                    + "<p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>"
                    + "<br/>"
                    + "<p>Best regards,<br/>FinTrack Pro Team</p>";
            body.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, entity, String.class);
            log.info("OTP email successfully sent via Brevo to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email via Brevo to {}", to, e);
            throw new RuntimeException("Failed to send email via Brevo. Please check Brevo configuration.");
        }
    }

    private void sendViaSmtp(String to, String otp) {
        if (fromEmail == null || fromEmail.contains("placeholder") || fromEmail.isBlank()) {
            log.warn("⚠️ SMTP fromEmail is unconfigured or placeholder ({}). OTP [{}] logged for dev/testing without sending external email.", fromEmail, otp);
            return;
        }

        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper =
                    new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "FinTrack Pro Security");
            helper.setTo(to);
            helper.setSubject("🔐 FinTrack Pro - Password Reset OTP");

            String html = "<div style=\"font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #070b14; color: #f1f5f9; padding: 36px 28px; border-radius: 20px; border: 1px solid #1e293b;\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "<h2 style=\"color: #6366f1; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;\">FinTrack Pro</h2>"
                    + "<span style=\"display: inline-block; font-size: 11px; font-weight: 700; background: rgba(99,102,241,0.15); color: #818cf8; padding: 4px 10px; border-radius: 9999px; margin-top: 6px; text-transform: uppercase;\">Encrypted Verification</span>"
                    + "</div>"
                    + "<h3 style=\"color: #ffffff; font-size: 18px; margin-top: 0; margin-bottom: 12px;\">Password Reset Request</h3>"
                    + "<p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;\">We received a request to reset the password for your FinTrack Pro account (<strong>" + to + "</strong>). Use the verification code below to proceed:</p>"
                    + "<div style=\"background: #0f172a; border: 2px dashed #6366f1; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 24px;\">"
                    + "<span style=\"font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: monospace;\">" + otp + "</span>"
                    + "</div>"
                    + "<p style=\"color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 8px;\">⏳ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>"
                    + "<p style=\"color: #64748b; font-size: 12px; line-height: 1.5;\">If you did not request this password reset, please ignore this email or update your security credentials immediately.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #1e293b; margin: 28px 0 16px 0;\" />"
                    + "<p style=\"color: #475569; font-size: 11px; text-align: center; margin: 0;\">© " + java.time.Year.now().getValue() + " FinTrack Pro · 256-Bit Vault Security</p>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("✅ Secure OTP HTML email dispatched successfully via Gmail SMTP to {}", to);
        } catch (Exception e) {
            log.error("❌ SMTP delivery attempt to {} failed: {}", to, e.getMessage(), e);
        }
    }
}
