using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Models.DTO;
using API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register (RegisterDTO request)
        {
            try
            {
                var result = await _userService.RegisterAsync(request);
                if (result == null) return Conflict(new {message = "Email already in use"});

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
            
        } 

        [HttpPost("login")]
        public async Task<IActionResult> Login (LoginDTO request)
        {
            var result = await _userService.LoginAsync(request);
            if (result == null) return Unauthorized(new {message = "Invalid email or password"});

            return Ok(result);
        } 
    }
}