using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace StudentManagement.Services
{
    public interface IGeminiService
    {
        Task<bool> VerifyFaceAsync(string referenceImageUrl, string capturedImageBase64);
    }

    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["Gemini:ApiKey"];
        }

        public async Task<bool> VerifyFaceAsync(string referenceImageUrl, string capturedImageBase64)
        {
            try
            {
                // 1. Download Reference Image (Avatar)
                byte[] referenceImageBytes;
                if (!string.IsNullOrEmpty(referenceImageUrl) && referenceImageUrl.StartsWith("http"))
                {
                    referenceImageBytes = await _httpClient.GetByteArrayAsync(referenceImageUrl);
                }
                else
                {
                    // Assume it's a local path or placeholder, might return false or handle differently
                    // For now, if no valid URL, we can't verify.
                     return false;
                }
                string referenceBase64 = Convert.ToBase64String(referenceImageBytes);

                // 2. Prepare Gemini Request
                // Clean captured base64 if it has header
                if (capturedImageBase64.Contains(","))
                {
                    capturedImageBase64 = capturedImageBase64.Split(',')[1];
                }

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = "Compare these two images. Are they the exact same person? If yes return 'YES', if no return 'NO'. Only return one word." },
                                new { inline_data = new { mime_type = "image/jpeg", data = referenceBase64 } },
                                new { inline_data = new { mime_type = "image/jpeg", data = capturedImageBase64 } }
                            }
                        }
                    }
                };
                
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
                
                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync(url, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var resultJson = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(resultJson);
                    var text = doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    return text?.Trim().ToUpper().Contains("YES") == true;
                }
                else 
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Gemini API Error: {error}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Face Verification Exception: {ex.Message}");
                return false;
            }
        }
    }
}
