package com.splitbill.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendDebtReminder(String toEmail, String fromName, long amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[PAYSHARE] Nhắc nhở thanh toán");
        message.setText("Chào bạn, " + fromName + " vừa nhắc bạn khoản nợ " + amount + "đ. Vào App kiểm tra ngay nhé!");
        mailSender.send(message);
    }
}