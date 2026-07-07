using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Entities
{
    public class User
    {
        [Required]
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long UserID {get; set;}

        [Required]
        public string? Email {get; set;}

        public string? PasswordHash {get; set;}

        [Required]
        public DateTime CreatedAt {get; set;}

        public DateTime? UpdatedAt {get; set;}
    }
}