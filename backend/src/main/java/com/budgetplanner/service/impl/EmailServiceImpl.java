package com.budgetplanner.service.impl;

import com.budgetplanner.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String to, String otp) {
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
            log.info("OTP email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", to, e);
            throw new RuntimeException("Failed to send email. Please check SMTP configuration.");
        }
    }
}
