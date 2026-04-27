public List<MemberStat> getGroupStats(String groupId) {
    List<Member> members = memberRepository.findByGroupId(groupId);
    List<Expense> expenses = expenseRepository.findByGroupId(groupId);

    return members.stream().map(m -> {
        long total = expenses.stream()
                .filter(e -> e.getPaidBy().equals(m.getId()))
                .mapToLong(Expense::getAmount)
                .sum();
        return new MemberStat(m.getName(), total);
    }).collect(Collectors.toList());
}