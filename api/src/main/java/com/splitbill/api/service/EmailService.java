package com.splitbill.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendDebtReminder(String toEmail, String groupName, Long amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        // Định dạng tiền tệ VND
        NumberFormat vnFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        String formattedAmount = vnFormat.format(amount);

        message.setFrom("payshare.hcm@gmail.com");
        message.setTo(toEmail);
        message.setSubject("[PAYSHARE] Nhắc nhở thanh toán khoản chi nhóm " + groupName);
        message.setText("Chào bạn,\n\nBạn có một khoản nợ cần thanh toán trong nhóm " + groupName + 
                        " với số tiền là: " + formattedAmount + 
                        "\n\nVui lòng đăng nhập PAYSHARE để kiểm tra và tất toán nhé!\n\nTrân trọng,\nĐội ngũ PAYSHARE.");

        mailSender.send(message);
    }
}