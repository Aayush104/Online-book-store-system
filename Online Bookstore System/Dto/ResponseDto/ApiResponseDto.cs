﻿namespace Online_Bookstore_System.Dto.ResponseDto
{
    public class ApiResponseDto
    {

        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public int StatusCode { get; set; }
        public object Data { get; set; }


    }
}
