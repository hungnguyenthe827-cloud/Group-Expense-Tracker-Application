@Component
public class JwtUtils {
    private String jwtSecret = "bi-mat-sieu-cap-cua-sep-kiet-2026-vui-ve";
    private int jwtExpirationMs = 86400000; // 1 ngày

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }
}