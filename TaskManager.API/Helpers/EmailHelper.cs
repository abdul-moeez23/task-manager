using System;

namespace TaskManager.API.Helpers
{
    public static class EmailHelper
    {
        public static string GenerateOtp(int length = 6)
        {
            var random = new Random();
            string otp = "";
            for (int i = 0; i < length; i++)
                otp += random.Next(0, 10).ToString();
            return otp;
        }
    }
}
