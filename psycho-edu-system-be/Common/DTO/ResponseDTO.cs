using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class ResponseDTO
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public object? Result { get; set; }
        public ResponseDTO(string message, int statusCode, bool success = false, object? result = null)
        {
            Message = message;
            StatusCode = statusCode;
            IsSuccess = success;
            Result = result;
        }
    }
}
