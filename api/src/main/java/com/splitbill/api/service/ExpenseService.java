package com.splitbill.api.service;

// 1. CÁC DÒNG IMPORT ĐỂ Ở TRÊN CÙNG
import com.splitbill.api.entity.Expense;
import com.splitbill.api.entity.GroupMember;
import com.splitbill.api.dto.MemberStat;
import com.splitbill.api.repository.ExpenseRepository;
import com.splitbill.api.repository.GroupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    // 2. TIÊM REPOSITORY ĐỂ Ở NGAY DƯỚI CLASS
    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    // ... (Các hàm thêm/xóa/sửa cũ của Sếp vẫn giữ nguyên ở đây) ...

    // 3. HÀM TÍNH TOÁN BIỂU ĐỒ ĐỂ Ở DƯỚI CÙNG
    public List<MemberStat> getGroupStats(String groupId) {
        // SỬ DỤNG ĐÚNG ENTITY LÀ GroupMember
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            long total = expenses.stream()
                    // Kiểm tra an toàn: người trả không bị null VÀ khớp với ID thành viên
                    .filter(e -> e.getPaidBy() != null && e.getPaidBy().equals(m.getId()))
                    // Kiểm tra an toàn: số tiền không bị null
                    .mapToLong(e -> e.getAmount() != null ? e.getAmount() : 0L)
                    .sum();

            return new MemberStat(m.getName(), total);
        }).collect(Collectors.toList());
    }
}