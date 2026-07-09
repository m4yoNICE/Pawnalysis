using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Models.DTO;

namespace API.Services.Interfaces
{
    public interface IUserService
    {
        Task<AuthResponseDTO?> RegisterAsync(RegisterDTO request);
        Task<AuthResponseDTO?> LoginAsync(LoginDTO request);
    }
}