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
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("FinTrack Pro - Password Reset OTP");
            message.setText("Dear User,\n\n"
                    + "You requested a password reset for your FinTrack Pro account.\n"
                    + "Your One-Time Password (OTP) is: " + otp + "\n\n"
                    + "This OTP is valid for 5 minutes. Please do not share it with anyone.\n\n"
                    + "Best regards,\n"
                    + "FinTrack Pro Team");
            mailSender.send(message);
            log.info("OTP email sent successfully via SMTP to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email via SMTP to {}", to, e);
            throw new RuntimeException("Failed to send email via SMTP. Please check SMTP configuration.");
        }
    }
}
