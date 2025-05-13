namespace Common.Settings
{
    public class JwtSettingModel
    {
        /// <summary>
        /// The Secret key of the jwt to generate access token.
        /// </summary>
        public static string SecretKey { get; set; } = "MgmI*//'tx\r\nv,9u8D7HBU\r\nq\"UB~w8:OX\r\nj4#bC:5#Ia\r\nP<3h\\fjy\\'\r\nUk5kWjKF&P\r\nF@!,4wz~)w\r\nemBA^\"`8)c\r\nTXRy5QLlU)\r\nS}q^pnr\"m";

        /// <summary>
        /// The expire days of the jwt to generate access token.
        /// </summary>
        public static int ExpireDayAccessToken { get; set; } = 1;

        /// <summary>
        /// The expire days of the jwt to generate refresh token.
        /// </summary>
        public static int ExpireDayRefreshToken { get; set; } = 30;

        /// <summary>
        /// The issuer of the token.
        /// </summary>
        public static string Issuer { get; set; } = "https://localhost:7192"; // Thay đổi cho phù hợp

        /// <summary>
        /// The audience of the token.
        /// </summary>
        public static string Audience { get; set; } = "https://localhost:7192"; // Thay đổi cho phù hợp
    }
}

