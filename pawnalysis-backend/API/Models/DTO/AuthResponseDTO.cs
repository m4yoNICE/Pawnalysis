using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Models.DTO
{
    public class AuthResponseDTO
    {
        public string? Token {get; set;}
        public string? Email {get; set;}
    }
}